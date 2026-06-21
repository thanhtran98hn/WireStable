import { NextRequest, NextResponse } from "next/server";
import { keccak256, toBytes, recoverMessageAddress } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { getWalletConfig, getClient } from "../../corporate/store";

// In-memory registry to track active channels
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
    const { initialDeposit, clientAddress, isSandbox } = await request.json();

    if (!initialDeposit || (!clientAddress && !isSandbox)) {
      return NextResponse.json(
        { error: "initialDeposit and clientAddress are required" },
        { status: 400 }
      );
    }

    const channelId = isSandbox ? `chan_sandbox_${Math.random().toString(36).substring(2, 12)}` : `chan_${Math.random().toString(36).substring(2, 12)}`;
    
    // Generate real private/public key for the buyer's off-chain channel signatures
    const clientPrivateKey = generatePrivateKey();
    const buyerAccount = privateKeyToAccount(clientPrivateKey);
    const clientPublicKey = buyerAccount.address;

    channelLedger[channelId] = {
      channelId,
      depositAmount: parseFloat(initialDeposit),
      clientAddress: clientAddress || "0x0000000000000000000000000000000000000000",
      clientPublicKey,
      cumulativeSettled: 0,
      status: "open",
    };

    console.log(`[Circle Gateway] Opened Nanopayment channel ${channelId} for buyer ${clientAddress}. Fund deposit: ${initialDeposit} USDC.`);

    const walletConfig = getWalletConfig();

    return NextResponse.json({
      success: true,
      channelId,
      clientPrivateKey,
      clientPublicKey,
      depositAddress: walletConfig.address, // corporate DCW treasury wallet address
      initialBalance: initialDeposit
    });
  } catch (error: any) {
    console.error("Open channel error:", error);
    return NextResponse.json({ error: error.message || "Failed to open channel" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { action, channelId, finalCumulativeAmount, signature, nonce, recipientAddress } = await request.json();

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

    // Verify cryptographic signature using viem to prevent double spending / hijacking
    if (!signature) {
      return NextResponse.json({ error: "Missing signature for channel state update" }, { status: 401 });
    }

    const message = `close:${channelId}:${finalCumulativeAmount}:${nonce}`;
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature: signature as `0x${string}`
    });

    if (recoveredAddress.toLowerCase() !== channel.clientPublicKey.toLowerCase()) {
      return NextResponse.json({ error: "Invalid cryptographic signature" }, { status: 401 });
    }

    const totalSpent = parseFloat(finalCumulativeAmount) || 0;
    const refundAmount = Math.max(0, channel.depositAmount - totalSpent);

    channel.status = "closed";
    channel.cumulativeSettled = totalSpent;

    console.log(`[Circle Gateway] Settling channel ${channelId}. Cumulative Merchant payout: ${totalSpent} USDC. Refunding Buyer: ${refundAmount} USDC.`);

    if (channelId.startsWith("chan_sandbox_")) {
      return NextResponse.json({
        success: true,
        channelId,
        status: "closed",
        settledAmount: totalSpent,
        refundAmount,
        txHash: "0x0000000000000000000000000000000000000000",
        explorerUrl: "https://testnet.arcscan.app/tx/0x0000000000000000000000000000000000000000"
      });
    }

    // Perform real on-chain transfers from Corporate Wallet if funds are settled
    const walletConfig = getWalletConfig();
    const client = getClient();
    const tokenAddress = "0x3600000000000000000000000000000000000000"; // USDC Arc Testnet

    let merchantTxHash = "";
    if (totalSpent > 0) {
      try {
        const merchantResponse = await client.createTransaction({
          walletId: walletConfig.walletId,
          tokenAddress,
          destinationAddress: recipientAddress || walletConfig.address,
          amount: [totalSpent.toFixed(6)],
          fee: {
            type: "level",
            config: { feeLevel: "MEDIUM" },
          },
        });
        const txId = merchantResponse.data?.id;
        if (!txId) {
          throw new Error("Merchant transfer transaction ID is missing");
        }

        // Poll status
        let retries = 15;
        while (retries > 0 && !merchantTxHash) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const statusRes = await client.getTransaction({ id: txId });
          const tx = statusRes.data?.transaction;
          if (tx?.txHash) {
            merchantTxHash = tx.txHash;
          } else if (tx?.state === "FAILED" || tx?.state === "DENIED") {
            break;
          }
          retries--;
        }
      } catch (err) {
        console.error("Failed to execute merchant payout transaction:", err);
      }
    }

    let refundTxHash = "";
    if (refundAmount > 0) {
      try {
        const refundResponse = await client.createTransaction({
          walletId: walletConfig.walletId,
          tokenAddress,
          destinationAddress: channel.clientAddress,
          amount: [refundAmount.toFixed(6)],
          fee: {
            type: "level",
            config: { feeLevel: "MEDIUM" },
          },
        });
        const txId = refundResponse.data?.id;
        if (!txId) {
          throw new Error("Refund transaction ID is missing");
        }

        // Poll status
        let retries = 15;
        while (retries > 0 && !refundTxHash) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const statusRes = await client.getTransaction({ id: txId });
          const tx = statusRes.data?.transaction;
          if (tx?.txHash) {
            refundTxHash = tx.txHash;
          } else if (tx?.state === "FAILED" || tx?.state === "DENIED") {
            break;
          }
          retries--;
        }
      } catch (err) {
        console.error("Failed to execute refund transaction:", err);
      }
    }

    const txHash = merchantTxHash || refundTxHash || "0x0000000000000000000000000000000000000000";

    return NextResponse.json({
      success: true,
      channelId,
      status: "closed",
      settledAmount: totalSpent,
      refundAmount,
      txHash,
      explorerUrl: `https://testnet.arcscan.app/tx/${txHash}`
    });
  } catch (error: any) {
    console.error("Settle channel error:", error);
    return NextResponse.json({ error: error.message || "Failed to settle channel" }, { status: 500 });
  }
}
