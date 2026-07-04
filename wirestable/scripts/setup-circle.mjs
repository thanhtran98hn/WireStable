import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple manual env parser to avoid dependency on dotenv
function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  const envLocalPath = path.resolve(__dirname, "..", ".env.local");
  
  const filesToTry = [envLocalPath, envPath];
  for (const filePath of filesToTry) {
    if (fs.existsSync(filePath)) {
      console.log(`Loading environment from ${filePath}`);
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
    console.error("Error: CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET is not configured in .env or .env.local");
    process.exit(1);
  }

  console.log("Initializing Developer Controlled Wallets Client...");
  const client = initiateDeveloperControlledWalletsClient({
    apiKey,
    entitySecret,
  });

  let walletSetId = "";
  let walletSetResponse;

  try {
    console.log("Checking for existing wallet sets...");
    walletSetResponse = await client.listWalletSets({ pageSize: 5 });
    const walletSets = walletSetResponse.data?.walletSets || [];
    if (walletSets.length > 0) {
      walletSetId = walletSets[0].id;
      console.log(`Using existing wallet set: ${walletSets[0].name} (ID: ${walletSetId})`);
    } else {
      console.log("No wallet sets found. Creating a new one...");
      const newWalletSet = await client.createWalletSet({
        name: "WireStable Corporate WalletSet"
      });
      walletSetId = newWalletSet.data?.walletSet?.id;
      console.log(`Created new wallet set: WireStable Corporate WalletSet (ID: ${walletSetId})`);
    }
  } catch (err) {
    console.error("Error managing wallet set:", err.message || err);
    process.exit(1);
  }

  let wallets = [];
  try {
    console.log(`Checking wallets in wallet set: ${walletSetId}...`);
    const walletsResponse = await client.listWallets({ walletSetId });
    wallets = walletsResponse.data?.wallets || [];
    console.log(`Found ${wallets.length} wallets.`);
  } catch (err) {
    console.error("Error listing wallets:", err.message || err);
    process.exit(1);
  }

  let arcWallet = wallets.find(w => w.blockchain === "ARC-TESTNET");

  if (!arcWallet) {
    console.log("No EOA wallet on ARC-TESTNET found. Creating one...");
    try {
      const createResponse = await client.createWallets({
        accountType: "EOA",
        blockchains: ["ARC-TESTNET"],
        count: 1,
        walletSetId
      });
      const newWallets = createResponse.data?.wallets || [];
      if (newWallets.length > 0) {
        arcWallet = newWallets[0];
        console.log(`Successfully created ARC-TESTNET EOA wallet: ${arcWallet.address} (ID: ${arcWallet.id})`);
      } else {
        throw new Error("API returned an empty list of created wallets.");
      }
    } catch (err) {
      console.error("Error creating ARC-TESTNET wallet:", err.message || err);
      process.exit(1);
    }
  } else {
    console.log(`Using existing ARC-TESTNET wallet: ${arcWallet.address} (ID: ${arcWallet.id})`);
  }

  // Write details to corporate_wallet.json
  const outputPath = path.resolve(__dirname, "..", "corporate_wallet.json");
  const outputData = {
    walletSetId,
    walletId: arcWallet.id,
    address: arcWallet.address
  };

  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), "utf-8");
  console.log(`\nSuccess! Wrote corporate wallet config to: ${outputPath}`);
  console.log(JSON.stringify(outputData, null, 2));
}

main().catch(console.error);
