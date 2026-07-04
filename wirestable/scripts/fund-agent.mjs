import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  const envLocalPath = path.resolve(__dirname, "..", ".env.local");
  const filesToTry = [envPath, envLocalPath];
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
    }
  }
}

async function main() {
  loadEnv();
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  const agentPrivateKey = process.env.AGENT_PRIVATE_KEY;

  if (!apiKey || !entitySecret || !agentPrivateKey) {
    console.error("Credentials or Agent private key not configured.");
    process.exit(1);
  }

  const walletPath = path.resolve(__dirname, "..", "corporate_wallet.json");
  if (!fs.existsSync(walletPath)) {
    console.error("corporate_wallet.json not found.");
    process.exit(1);
  }

  const { walletId, address: treasuryAddress } = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
  const agentAccount = privateKeyToAccount(agentPrivateKey);
  const agentAddress = agentAccount.address;

  console.log(`Treasury Address: ${treasuryAddress}`);
  console.log(`Agent Address:    ${agentAddress}`);

  const client = initiateDeveloperControlledWalletsClient({
    apiKey,
    entitySecret,
  });

  console.log("Initiating transfer of 4 USDC from treasury to agent to fund gas...");
  try {
    const txResponse = await client.createTransaction({
      walletId,
      tokenId: "ef87c8c3-85de-598a-af50-c5135eecfa74", // ERC20 USDC Token ID
      destinationAddress: agentAddress,
      amount: ["4.00"],
      fee: {
        type: "level",
        config: { feeLevel: "MEDIUM" },
      },
    });

    const txId = txResponse.data?.id;
    console.log(`Transaction submitted to Circle. Tx ID: ${txId}`);
    console.log("Polling for transaction confirmation...");

    let txHash = "";
    let retries = 20;
    while (retries > 0 && !txHash) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const statusRes = await client.getTransaction({ id: txId });
      const tx = statusRes.data?.transaction;
      if (tx?.txHash) {
        txHash = tx.txHash;
        console.log(`Confirmed! Gas funded successfully.`);
        console.log(`Tx Hash: ${txHash}`);
        break;
      } else if (tx?.state === "FAILED" || tx?.state === "DENIED") {
        throw new Error(`Transaction failed: ${tx.state} (Reason: ${tx.errorReason || "Unknown"})`);
      }
      retries--;
    }
  } catch (err) {
    console.error("Funding failed:", err.message || err);
  }
}

main().catch(console.error);
