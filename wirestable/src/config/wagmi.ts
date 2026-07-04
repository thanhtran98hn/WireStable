"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arcTestnet, sepolia } from "viem/chains";
import { http } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo_project_id";
console.log("[Wagmi Config] Initializing with Project ID:", projectId);

export const config = getDefaultConfig({
  appName: "WireStable",
  projectId: projectId,
  chains: [arcTestnet, sepolia],
  ssr: true,
  transports: {
    [arcTestnet.id]: http("https://rpc.testnet.arc.network"),
    [sepolia.id]: http(),
  },
});
