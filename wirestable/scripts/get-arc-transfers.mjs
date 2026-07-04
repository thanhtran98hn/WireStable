import { createPublicClient, http, formatUnits } from "viem";
import { arcTestnet } from "viem/chains";

const USDC_ARC_ADDRESS = "0x3600000000000000000000000000000000000000";

// Standard ERC20 Transfer event signature topic: Transfer(address,address,uint256)
const TRANSFER_EVENT_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function main() {
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network"),
  });

  try {
    const currentBlock = await publicClient.getBlockNumber();
    console.log(`Current Block Number on Arc: ${currentBlock}`);

    // Query logs for the last 1000 blocks
    const logs = await publicClient.getLogs({
      address: USDC_ARC_ADDRESS,
      event: {
        type: "event",
        name: "Transfer",
        inputs: [
          { type: "address", name: "from", indexed: true },
          { type: "address", name: "to", indexed: true },
          { type: "uint256", name: "value", indexed: false }
        ]
      },
      fromBlock: currentBlock - 2000n,
      toBlock: currentBlock
    });

    console.log(`Found ${logs.length} USDC Transfer events in the last 2000 blocks:`);
    for (const log of logs.slice(0, 5)) {
      const { from, to, value } = log.args;
      console.log(`Block #${log.blockNumber}: Sent ${formatUnits(value, 6)} USDC from ${from} to ${to}`);
    }
  } catch (err) {
    console.error("Failed to fetch logs:", err.message || err);
  }
}

main().catch(console.error);
