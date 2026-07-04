import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple manual env parser
function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  const envLocalPath = path.resolve(__dirname, "..", ".env.local");
  const filesToTry = [envLocalPath, envPath];
  for (const filePath of filesToTry) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const firstEquals = trimmed.indexOf("=");
          const key = trimmed.substring(0, firstEquals).trim();
          const val = trimmed.substring(firstEquals + 1).trim();
          process.env[key] = val;
        }
      }
      break;
    }
  }
}

async function main() {
  loadEnv();
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!apiKey || !entitySecret) {
    console.error("Circle credentials not configured.");
    process.exit(1);
  }

  const walletPath = path.resolve(__dirname, "..", "corporate_wallet.json");
  if (!fs.existsSync(walletPath)) {
    console.error("corporate_wallet.json not found.");
    process.exit(1);
  }

  const { walletId } = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
  console.log(`Fetching transactions for Wallet ID: ${walletId}...`);

  const client = initiateDeveloperControlledWalletsClient({
    apiKey,
    entitySecret,
  });

  try {
    const response = await client.listTransactions({
      walletIds: [walletId],
      pageSize: 10
    });
    const txs = response.data?.transactions || [];
    console.log(`Found ${txs.length} transactions:`);
    console.log(JSON.stringify(txs, null, 2));
  } catch (err) {
    console.error("Failed to list transactions:", err.message || err);
  }
}

main().catch(console.error);
