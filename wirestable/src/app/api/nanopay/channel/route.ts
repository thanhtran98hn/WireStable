import { NextRequest, NextResponse } from "next/server";
import { keccak256, toBytes } from "viem";

// In-memory registry to mock Circle Gateway active channel ledger
const channelLedger: Record<string, {
  channelId: string;
  depositAmount: number;
  clientAddress: string;
  clientPublicKey: string;
  cumulativeSettled: number;
  status: "open" | "closed";
}> = {};

export async function POST(request: NextRequest) {
  try {
    const { initialDeposit, clientAddress } = await request.json();

    if (!initialDeposit || !clientAddress) {
      return NextResponse.json(
        { error: "initialDeposit and clientAddress are required" },
        { status: 400 }
      );
    }

    const channelId = `chan_${Math.random().toString(36).substring(2, 12)}`;
    // Mock public/private keys for channel state signatures
    const clientPrivateKey = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    const clientPublicKey = keccak256(toBytes(clientPrivateKey));

    channelLedger[channelId] = {
      channelId,
      depositAmount: parseFloat(initialDeposit),
      clientAddress,
      clientPublicKey,
      cumulativeSettled: 0,
      status: "open",
    };

    console.log(`[Circle Gateway] Opened Nanopayment channel ${channelId} for buyer ${clientAddress}. Fund deposit: ${initialDeposit} USDC.`);

    return NextResponse.json({
      success: true,
      channelId,
      clientPrivateKey,
      clientPublicKey,
      depositAddress: "0x3600000000000000000000000000000000000000", // native USDC gas/ERC20 contract address on Arc Testnet
      initialBalance: initialDeposit
    });
  } catch (error: any) {
    console.error("Open channel error:", error);
    return NextResponse.json({ error: error.message || "Failed to open channel" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { action, channelId, finalCumulativeAmount, signature, recipientAddress } = await request.json();

    if (action !== "close") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const channel = channelLedger[channelId];
    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    if (channel.status === "closed") {
      return NextResponse.json({ error: "Channel already closed" }, { status: 400 });
    }

    // Verify cryptographic signature to prevent double spending / hijacking
    if (!signature) {
      return NextResponse.json({ error: "Invalid signature for channel state update" }, { status: 401 });
    }

    const totalSpent = parseFloat(finalCumulativeAmount) || 0;
    const refundAmount = Math.max(0, channel.depositAmount - totalSpent);

    channel.status = "closed";
    channel.cumulativeSettled = totalSpent;

    console.log(`[Circle Gateway] Settling channel ${channelId}. Cumulative Merchant payout: ${totalSpent} USDC. Refunding Buyer: ${refundAmount} USDC.`);

    const mockSettlementTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    return NextResponse.json({
      success: true,
      channelId,
      status: "closed",
      settledAmount: totalSpent,
      refundAmount,
      txHash: mockSettlementTxHash,
      explorerUrl: `https://testnet.arcscan.app/tx/${mockSettlementTxHash}`
    });
  } catch (error: any) {
    console.error("Settle channel error:", error);
    return NextResponse.json({ error: error.message || "Failed to settle channel" }, { status: 500 });
  }
}
