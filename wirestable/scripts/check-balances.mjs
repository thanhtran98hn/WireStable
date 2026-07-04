import { createPublicClient, http, formatUnits } from "viem";
import { arcTestnet } from "viem/chains";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const USDC_ARC_ADDRESS = "0x3600000000000000000000000000000000000000";
const EURC_ARC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

const erc20Abi = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
];

async function main() {
  const walletPath = path.resolve(__dirname, "..", "corporate_wallet.json");
  if (!fs.existsSync(walletPath)) {
    console.error("corporate_wallet.json not found.");
    process.exit(1);
  }

  // Load environment variables
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

  const { address } = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
  
  let agentAddress = "0x12380Fc2c9FDfe7c2b95ff964aB743cc6C93DbC4";
  if (process.env.AGENT_PRIVATE_KEY) {
    try {
      const { privateKeyToAccount } = await import("viem/accounts");
      agentAddress = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY).address;
    } catch (e) {
      console.warn("Failed to derive agent address from AGENT_PRIVATE_KEY:", e.message);
    }
  }
  
  console.log(`Checking balances for Treasury Address: ${address}`);
  console.log(`Checking balances for Agent/Deployer: ${agentAddress}`);

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  });

  // Query Treasury Balances
  try {
    const gasBalance = await publicClient.getBalance({ address });
    console.log(`Treasury Gas: ${formatUnits(gasBalance, 18)} USDC/gas`);
  } catch (e) {
    console.error("Failed to fetch treasury gas balance:", e.message);
  }

  try {
    const usdcBalance = await publicClient.readContract({
      address: USDC_ARC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });
    console.log(`Treasury USDC: ${formatUnits(usdcBalance, 6)} USDC`);
  } catch (e) {
    console.error("Failed to fetch treasury USDC balance:", e.message);
  }

  // Query Agent Balances
  try {
    const gasBalance = await publicClient.getBalance({ address: agentAddress });
    console.log(`Agent Gas: ${formatUnits(gasBalance, 18)} USDC/gas`);
  } catch (e) {
    console.error("Failed to fetch agent gas balance:", e.message);
  }

  try {
    const usdcBalance = await publicClient.readContract({
      address: USDC_ARC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [agentAddress],
    });
    console.log(`Agent USDC: ${formatUnits(usdcBalance, 6)} USDC`);
  } catch (e) {
    console.error("Failed to fetch agent USDC balance:", e.message);
  }
}

main().catch(console.error);
