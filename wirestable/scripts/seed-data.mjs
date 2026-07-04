import { createPublicClient, createWalletClient, http, parseUnits } from "viem";
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

const erc20Abi = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
];

const streamAbi = [
  {
    name: "createStream",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amountPerSecond", type: "uint256" },
      { name: "stopTime", type: "uint256" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  }
];

const escrowAbi = [
  {
    name: "createJob",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "employee", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "deliverableHash", type: "bytes32" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  }
];

async function main() {
  loadEnv();
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    console.error("AGENT_PRIVATE_KEY is missing.");
    process.exit(1);
  }

  const walletPath = path.resolve(__dirname, "..", "corporate_wallet.json");
  if (!fs.existsSync(walletPath)) {
    console.error("corporate_wallet.json not found.");
    process.exit(1);
  }
  const { address: treasuryAddress } = JSON.parse(fs.readFileSync(walletPath, "utf-8"));

  const deployedPath = path.resolve(__dirname, "..", "deployed_contracts.json");
  if (!fs.existsSync(deployedPath)) {
    console.error("deployed_contracts.json not found. Run deploy-contracts.mjs first.");
    process.exit(1);
  }
  const { streamAddress, escrowAddress } = JSON.parse(fs.readFileSync(deployedPath, "utf-8"));

  const account = privateKeyToAccount(privateKey);
  console.log(`Agent Deployer address: ${account.address}`);
  console.log(`Treasury Address:       ${treasuryAddress}`);
  console.log(`PayStreamVault Address: ${streamAddress}`);
  console.log(`ERC8183Escrow Address:  ${escrowAddress}`);

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  });

  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  });

  // 1. Setup Stream
  console.log("\n--- Seeding Payment Stream ---");
  const stopTime = BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60); // 7 days from now
  const amountPerSecond = 5n; // 5 micro-USDC per second (~3 USDC total)
  const duration = stopTime - BigInt(Math.floor(Date.now() / 1000));
  const totalStreamAmount = amountPerSecond * duration;

  console.log(`Approving StreamVault to spend ${totalStreamAmount} micro-USDC...`);
  let hash = await walletClient.writeContract({
    address: USDC_ARC_ADDRESS,
    abi: erc20Abi,
    functionName: "approve",
    args: [streamAddress, totalStreamAmount]
  });
  console.log(`Approval transaction sent: ${hash}`);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("Approved.");

  console.log(`Creating salary stream to Treasury address...`);
  hash = await walletClient.writeContract({
    address: streamAddress,
    abi: streamAbi,
    functionName: "createStream",
    args: [treasuryAddress, amountPerSecond, stopTime]
  });
  console.log(`Stream transaction sent: ${hash}`);
  const streamReceipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Stream created successfully!");

  // 2. Setup Escrow
  console.log("\n--- Seeding Escrow Job ---");
  const escrowAmount = parseUnits("5.0", 6); // 5 USDC (6 decimals)
  console.log(`Approving Escrow to spend ${escrowAmount} micro-USDC...`);
  hash = await walletClient.writeContract({
    address: USDC_ARC_ADDRESS,
    abi: erc20Abi,
    functionName: "approve",
    args: [escrowAddress, escrowAmount]
  });
  console.log(`Approval transaction sent: ${hash}`);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("Approved.");

  console.log(`Creating escrow job for Treasury address...`);
  const mockHash = "0x48656c6c6f000000000000000000000000000000000000000000000000000000"; // Hello in bytes32
  hash = await walletClient.writeContract({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: "createJob",
    args: [treasuryAddress, escrowAmount, mockHash]
  });
  console.log(`Escrow transaction sent: ${hash}`);
  const escrowReceipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Escrow job created successfully!");

  console.log("\n=============================================");
  console.log("ON-CHAIN BOOTSTRAP DATA SUCCESSFUL");
  console.log("=============================================");
}

main().catch(console.error);
