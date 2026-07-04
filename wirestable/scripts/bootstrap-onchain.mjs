import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { createPublicClient, http, formatUnits } from "viem";
import { arcTestnet } from "viem/chains";
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

const USDC_ARC_ADDRESS = "0x3600000000000000000000000000000000000000";

async function main() {
  loadEnv();
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!apiKey || !entitySecret) {
    console.error("Circle credentials not configured in environment.");
    process.exit(1);
  }

  const walletPath = path.resolve(__dirname, "..", "corporate_wallet.json");
  if (!fs.existsSync(walletPath)) {
    console.error("corporate_wallet.json not found. Run scripts/setup-circle.mjs first.");
    process.exit(1);
  }

  const { walletId, address } = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
  console.log("=================================================");
  console.log(`Treasury Wallet Address: ${address}`);
  console.log(`Treasury Wallet ID:      ${walletId}`);
  console.log("=================================================");

  const client = initiateDeveloperControlledWalletsClient({
    apiKey,
    entitySecret,
  });

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  });

  // Check current gas & USDC balance
  console.log("Querying on-chain balances...");
  let usdcBalance = 0;
  let nativeGas = 0n;

  try {
    nativeGas = await publicClient.getBalance({ address });
    console.log(`Native Gas Token: ${formatUnits(nativeGas, 18)} USDC/gas`);
  } catch (e) {
    console.error("Failed to read gas balance:", e.message);
  }

  try {
    const balanceResponse = await client.getWalletTokenBalance({ id: walletId });
    const balances = balanceResponse.data?.tokenBalances || [];
    const usdc = balances.find((b) => b.token.symbol === "USDC");
    if (usdc) {
      usdcBalance = parseFloat(usdc.amount);
    }
    console.log(`Treasury USDC:    ${usdcBalance} USDC`);
  } catch (e) {
    console.error("Failed to read USDC balance from Circle:", e.message);
  }

  if (usdcBalance === 0) {
    console.log("\n=================================================");
    console.log("WARNING: Treasury Wallet contains 0 USDC.");
    console.log("To fully bootstrap and seed real on-chain transaction history:");
    console.log("1. Go to the official Circle Testnet Faucet: https://faucet.circle.com");
    console.log("2. Select 'Arc Testnet' network and asset 'USDC'");
    console.log(`3. Submit faucet requests to: ${address}`);
    console.log("4. Re-run this bootstrap script once funded.");
    console.log("=================================================");
    return;
  }

  // If there is USDC, execute a self-seed transaction to build real history!
  console.log("\nExecuting seed transaction to establish real history on Arc...");
  try {
    // Send a tiny amount of USDC to itself or to the default validator to generate real history
    const seedAmount = "0.01";
    const transferResponse = await client.createTransaction({
      walletId,
      tokenAddress: USDC_ARC_ADDRESS,
      destinationAddress: address, // Self-transfer to keep funds in the treasury
      amount: [seedAmount],
      fee: {
        type: "level",
        config: { feeLevel: "LOW" },
      },
    });

    const txId = transferResponse.data?.id;
    console.log(`Submitted self-seed transaction. Circle Tx ID: ${txId}`);

    console.log("Polling for block finalization...");
    let txHash = "";
    let retries = 20;
    while (retries > 0 && !txHash) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const statusRes = await client.getTransaction({ id: txId });
      const tx = statusRes.data?.transaction;
      if (tx?.txHash) {
        txHash = tx.txHash;
        console.log(`Success! Transaction confirmed on Arc Testnet.`);
        console.log(`Tx Hash:       ${txHash}`);
        console.log(`Explorer URL:  https://testnet.arcscan.app/tx/${txHash}`);
        break;
      } else if (tx?.state === "FAILED" || tx?.state === "DENIED") {
        throw new Error(`Transaction failed with state: ${tx.state}`);
      }
      retries--;
    }
  } catch (err) {
    console.error("Failed to execute on-chain seed transaction:", err.message || err);
  }
}

main().catch(console.error);
