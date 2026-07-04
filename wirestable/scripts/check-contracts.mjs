import { createPublicClient, http } from "viem";
import { arcTestnet } from "viem/chains";

async function main() {
  const c = createPublicClient({
    chain: arcTestnet,
    transport: http("https://rpc.testnet.arc.network")
  });

  const addresses = [
    { name: "PayStreamVault", address: "0x946b1c09893d596489b4de5de586616fe28c0571" },
    { name: "ERC8183Escrow", address: "0x8183e5c7075c1c09893d596489b4de5de586616fe" },
    { name: "ERC8004Registry", address: "0x8004e3b79ce858c0df1b44ec069f1092eb27ef86" }
  ];

  for (const item of addresses) {
    try {
      const code = await c.getBytecode({ address: item.address });
      console.log(`${item.name} (${item.address}): bytecode length = ${code ? code.length : 0}, isDeployed = ${code && code !== "0x"}`);
    } catch (e) {
      console.error(`Failed to check ${item.name}:`, e.message);
    }
  }
}

main().catch(console.error);
