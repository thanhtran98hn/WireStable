import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const emojiRegex = /[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g;
const specificTargets = ["ℹ️", "ℹ", "🔑", "🌉", "📈", "🔒", "⚡", "🤖", "🌐", "💼", "💸", "📊", "🎯", "🌟", "🛡️", "🛡", "💰", "⚙️", "⚙", "🤝", "📥", "📤", "📝"];

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".next" && file !== "artifacts" && file !== "cache") {
        searchDir(fullPath);
      }
    } else {
      const ext = path.extname(file);
      if (ext === ".tsx" || ext === ".ts") {
        const content = fs.readFileSync(fullPath, "utf-8");
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Ignore comment lines
          if (line.startsWith("//") || line.startsWith("*") || line.startsWith("/*")) {
            continue;
          }
          
          let matches = line.match(emojiRegex) || [];
          for (const target of specificTargets) {
            if (line.includes(target)) {
              matches.push(target);
            }
          }
          
          // Filter out safe arrows (→, ↗, ←, etc.) or checkmarks (✓, ✗) or dashes (—)
          const filtered = [...new Set(matches)].filter(m => {
            return !["→", "↗", "←", "✓", "✗", "—", "•", "–", "™", "©", "®"].includes(m);
          });
          
          if (filtered.length > 0) {
            console.log(`${path.relative(path.resolve(__dirname, ".."), fullPath)}:${i + 1} -> ${line} (Emojis: ${filtered.join(", ")})`);
          }
        }
      }
    }
  }
}

const rootSrc = path.resolve(__dirname, "..", "src");
searchDir(rootSrc);
