import { NextResponse } from "next/server";
import { createPublicClient, http, formatUnits } from "viem";
import { sepolia, baseSepolia, arbitrumSepolia, arcTestnet } from "viem/chains";

const USDC_ARC_ADDRESS = "0x3600000000000000000000000000000000000000";
const USDC_SEPOLIA_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const USDC_BASE_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const USDC_ARBITRUM_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

const erc20Abi = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
] as const;

async function getEvmBalance(address: string, chain: any, tokenAddress: `0x${string}`): Promise<number> {
  try {
    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });
    const balanceBigInt = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    }) as bigint;
    return parseFloat(formatUnits(balanceBigInt, 6));
  } catch (err) {
    console.warn(`Could not read balance for chain ${chain.name}:`, err);
    return 0;
  }
}

async function getSolanaBalance(solAddress: string): Promise<number> {
  try {
    const response = await fetch("https://api.devnet.solana.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [
          solAddress,
          { mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU" },
          { encoding: "jsonParsed" }
        ]
      })
    });
    if (response.ok) {
      const data = await response.json();
      const accounts = data.result?.value || [];
      let total = 0;
      for (const account of accounts) {
        const amount = account.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
        if (amount) total += amount;
      }
      return total;
    }
  } catch (err) {
    console.warn("Could not read Solana balance:", err);
  }
  return 0;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address query parameter is required" },
        { status: 400 }
      );
    }

    const isEvm = address.startsWith("0x");

    if (isEvm) {
      const [arcBalance, baseBalance, ethBalance, arbBalance] = await Promise.all([
        getEvmBalance(address, arcTestnet, USDC_ARC_ADDRESS),
        getEvmBalance(address, baseSepolia, USDC_BASE_ADDRESS),
        getEvmBalance(address, sepolia, USDC_SEPOLIA_ADDRESS),
        getEvmBalance(address, arbitrumSepolia, USDC_ARBITRUM_ADDRESS),
      ]);

      const unifiedBalance = arcBalance + baseBalance + ethBalance + arbBalance;

      return NextResponse.json({
        success: true,
        unifiedBalance: parseFloat(unifiedBalance.toFixed(6)),
        chains: [
          { chain: "Arc_Testnet", balance: parseFloat(arcBalance.toFixed(6)), address },
          { chain: "Base_Sepolia", balance: parseFloat(baseBalance.toFixed(6)), address },
          { chain: "Ethereum_Sepolia", balance: parseFloat(ethBalance.toFixed(6)), address },
          { chain: "Arbitrum_Sepolia", balance: parseFloat(arbBalance.toFixed(6)), address },
        ],
        timestamp: new Date().toISOString(),
      });
    } else {
      // Solana address
      const solBalance = await getSolanaBalance(address);

      return NextResponse.json({
        success: true,
        unifiedBalance: parseFloat(solBalance.toFixed(6)),
        chains: [
          { chain: "Solana_Devnet", balance: parseFloat(solBalance.toFixed(6)), address },
        ],
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
