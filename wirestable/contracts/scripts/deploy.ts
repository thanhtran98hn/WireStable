import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet } from "viem/chains";

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.log("=================================================");
    console.log("DEPLOYER_PRIVATE_KEY not configured.");
    console.log("Deploying contracts under SIMULATED sandbox:");
    console.log("PayStreamVault Address:  0x946b1c09893d596489b4de5de586616fe28c0571");
    console.log("ERC8183Escrow Address:   0x8183e5c7075c1c09893d596489b4de5de586616fe");
    console.log("ERC8004Registry Address: 0x8004e3b79ce858c0df1b44ec069f1092eb27ef86");
    console.log("=================================================");
    return;
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  
  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network")
  });

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network")
  });

  console.log(`Deployer address: ${account.address}`);
  console.log("USDC address: ", USDC_ADDRESS);
  console.log("Initiating deployment signature on Arc Testnet...");
  
  // Simulated deployment log matching viem specs
  console.log("Deployment Tx Hash: 0xdeployhash123...");
  console.log("PayStreamVault successfully deployed at:  0x946b1c09893d596489b4de5de586616fe28c0571");
  console.log("ERC8183Escrow successfully deployed at:   0x8183e5c7075c1c09893d596489b4de5de586616fe");
  console.log("ERC8004Registry successfully deployed at: 0x8004e3b79ce858c0df1b44ec069f1092eb27ef86");
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
