import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet } from "viem/chains";
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

const USDC_ARC_ADDRESS = "0x3600000000000000000000000000000000000000";
const EURC_ARC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

async function main() {
  loadEnv();
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    console.error("AGENT_PRIVATE_KEY is missing.");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);
  console.log(`Deployer address: ${account.address}`);

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  });

  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  });

  // Verify deployer has balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Deployer balance: ${balance} gas units`);

  // Helper to load artifacts
  const getArtifact = (name) => {
    const artifactPath = path.resolve(__dirname, "..", "artifacts", "contracts", `${name}.sol`, `${name}.json`);
    if (!fs.existsSync(artifactPath)) {
      throw new Error(`Artifact for ${name} not found. Please run npx hardhat compile.`);
    }
    return JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  };

  const deployContract = async (name, args = []) => {
    console.log(`\n--- Deploying ${name} ---`);
    const { abi, bytecode } = getArtifact(name);
    
    const hash = await walletClient.deployContract({
      abi,
      bytecode,
      args,
    });
    console.log(`Transaction sent. Hash: ${hash}`);
    console.log("Waiting for receipt...");
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`${name} deployed successfully!`);
    console.log(`Contract Address: ${receipt.contractAddress}`);
    return receipt.contractAddress;
  };

  try {
    // 1. ERC8004Registry
    const registryAddress = await deployContract("ERC8004Registry");

    // 2. PayStreamVault
    const streamAddress = await deployContract("PayStreamVault", [USDC_ARC_ADDRESS]);

    // 3. ERC8183Escrow
    const escrowAddress = await deployContract("ERC8183Escrow", [USDC_ARC_ADDRESS, account.address]);

    // 4. HedgingPoolRouter
    const hedgingAddress = await deployContract("HedgingPoolRouter", [
      USDC_ARC_ADDRESS,
      EURC_ARC_ADDRESS,
      "0x0000000000000000000000000000000000000000"
    ]);

    console.log("\n=============================================");
    console.log("ALL CONTRACTS DEPLOYED SUCCESSFULLY ON ARC TESTNET:");
    console.log(`ERC8004Registry:  ${registryAddress}`);
    console.log(`PayStreamVault:   ${streamAddress}`);
    console.log(`ERC8183Escrow:    ${escrowAddress}`);
    console.log(`HedgingPoolRouter: ${hedgingAddress}`);
    console.log("=============================================");

    // Save deployed addresses to root directory for reference
    const deployedData = {
      registryAddress,
      streamAddress,
      escrowAddress,
      hedgingAddress,
      timestamp: Date.now()
    };
    fs.writeFileSync(
      path.resolve(__dirname, "..", "deployed_contracts.json"),
      JSON.stringify(deployedData, null, 2),
      "utf-8"
    );
    console.log("Saved deployed contract addresses to deployed_contracts.json.");

  } catch (err) {
    console.error("Deployment failed:", err);
  }
}

main().catch(console.error);
