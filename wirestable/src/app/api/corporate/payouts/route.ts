import { NextRequest, NextResponse } from "next/server";
import { getCorporateWallet, updateWallet, getWalletConfig, getClient } from "../store";
import { rateLimit } from "@/utils/rateLimiter";
import { logger } from "@/utils/logger";

export interface Payout {
  recipientName: string;
  address: string;
  amount: string;
  status: "pending" | "processing" | "success" | "failed";
  txHash?: string;
}

export interface PayoutBatch {
  id: string;
  payouts: Payout[];
  totalAmount: string;
  token: "USDC" | "EURC";
  status: "pending_approval" | "approved" | "completed" | "failed";
  createdAt: number;
  redemptionNote?: string;
}

// In-memory persistence for temporary Maker-Checker batches pending administrative approval
let localPendingBatches: PayoutBatch[] = [];

async function getRealPayoutsFromCircle(): Promise<PayoutBatch[]> {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!apiKey || !entitySecret) {
    return [];
  }

  const config = getWalletConfig();
  const client = getClient();

  try {
    const response = await client.listTransactions({
      walletIds: [config.walletId],
      pageSize: 20
    });
    const txs = response.data?.transactions || [];

    return txs.map((tx: any) => {
      // Circle API returns amounts as string array (e.g., ["10.00"])
      const amount = tx.amounts?.[0] || "0.00";
      // Identify token type from contract address
      const isUsdc = tx.tokenAddress?.toLowerCase() === "0x3600000000000000000000000000000000000000";
      const tokenSymbol = isUsdc ? "USDC" : "EURC";

      const statusMap = {
        "COMPLETE": "completed" as const,
        "FAILED": "failed" as const,
        "DENIED": "failed" as const,
        "PENDING": "approved" as const,
      };

      const status = statusMap[tx.state as keyof typeof statusMap] || "completed";

      return {
        id: tx.id,
        totalAmount: amount,
        token: tokenSymbol,
        status,
        createdAt: new Date(tx.createDate || Date.now()).getTime(),
        payouts: [
          {
            recipientName: `Treasury Disbursal (${tx.operationType || "Transfer"})`,
            address: tx.destinationAddress || "0x",
            amount,
            status: tx.state === "COMPLETE" ? ("success" as const) : tx.state === "FAILED" || tx.state === "DENIED" ? ("failed" as const) : ("processing" as const),
            txHash: tx.txHash || undefined
          }
        ]
      };
    });
  } catch (err: any) {
    console.error("Failed to query real transactions from Circle API:", err.message || err);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const limiter = rateLimit(request, 60);
  if (!limiter.success) {
    logger.warn({
      category: "API",
      event: "RATE_LIMIT_EXCEEDED",
      message: "Rate limit reached on GET payouts",
      ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    // 1. Fetch real completed transactions from Arc Testnet
    const realBatches = await getRealPayoutsFromCircle();

    // 2. Fetch local Maker batches pending approval
    const pendingBatches = localPendingBatches.filter(b => b.status === "pending_approval");

    // 3. Merge and return
    const allBatches = [...pendingBatches, ...realBatches];
    return NextResponse.json(allBatches);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const limiter = rateLimit(request, 15);
  if (!limiter.success) {
    logger.warn({
      category: "API",
      event: "RATE_LIMIT_EXCEEDED",
      message: "Rate limit reached on POST payouts",
      ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json({ error: "Too many write requests. Please wait before retrying." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { payouts, token = "USDC" } = body;

    if (!payouts || !Array.isArray(payouts) || payouts.length === 0) {
      return NextResponse.json({ error: "Invalid or empty payouts list" }, { status: 400 });
    }

    // Validate entries
    const validatedPayouts: Payout[] = payouts.map((p: any) => {
      const amt = parseFloat(p.amount);
      if (isNaN(amt) || amt <= 0) {
        throw new Error(`Invalid amount for recipient ${p.recipientName || p.address}`);
      }
      return {
        recipientName: p.recipientName || "Contractor",
        address: p.address,
        amount: amt.toFixed(2),
        status: "pending"
      };
    });

    const total = validatedPayouts.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toFixed(2);

    const newBatch: PayoutBatch = {
      id: `batch_${Math.random().toString(36).substring(2, 11)}`,
      payouts: validatedPayouts,
      totalAmount: total,
      token,
      status: "pending_approval",
      createdAt: Date.now()
    };

    localPendingBatches.push(newBatch);

    logger.info({
      category: "TRANSACTION",
      event: "PAYOUT_BATCH_SUBMITTED",
      message: `Submitted batch ${newBatch.id} for total of ${total} ${token} (Maker Step)`,
      ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
      metadata: {
        batchId: newBatch.id,
        totalAmount: total,
        token,
        payoutsCount: validatedPayouts.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payout batch submitted (Maker Step). Awaiting administrative approval.",
      batch: newBatch
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// PUT endpoint to approve and execute the batch payouts sequentially (Checker step)
export async function PUT(request: NextRequest) {
  const limiter = rateLimit(request, 15);
  if (!limiter.success) {
    logger.warn({
      category: "API",
      event: "RATE_LIMIT_EXCEEDED",
      message: "Rate limit reached on PUT payouts approval",
      ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { batchId, action } = body;

    if (!batchId) {
      return NextResponse.json({ error: "Missing batchId parameter" }, { status: 400 });
    }

    const batchIndex = localPendingBatches.findIndex((b) => b.id === batchId);
    if (batchIndex === -1) {
      return NextResponse.json({ error: "Batch not found or already processed" }, { status: 404 });
    }

    const batch = localPendingBatches[batchIndex];

    if (action === "approve") {
      if (batch.status !== "pending_approval") {
        return NextResponse.json({ error: "Batch is not awaiting approval" }, { status: 400 });
      }

      // Sync and calculate latest yields
      const wallet = await getCorporateWallet();
      const config = getWalletConfig();
      const client = getClient();

      const totalNeeded = parseFloat(batch.totalAmount);
      let redemptionNote = "";

      if (batch.token === "USDC") {
        if (wallet.usdcBalance < totalNeeded) {
          const shortfall = totalNeeded - wallet.usdcBalance;
          if (wallet.usycBalance >= shortfall) {
            // Auto-redemption of USYC to USDC
            await updateWallet({
              usycBalance: wallet.usycBalance - shortfall
            });
            redemptionNote = `Auto-redeemed ${shortfall.toFixed(2)} USYC to cover the USDC shortfall.`;
          } else {
            return NextResponse.json(
              { error: `Insufficient treasury funds. Combined liquid USDC + USYC pool has only ${(wallet.usdcBalance + wallet.usycBalance).toFixed(2)} USDC but requires ${totalNeeded.toFixed(2)} USDC.` },
              { status: 400 }
            );
          }
        }
      } else if (batch.token === "EURC") {
        if (wallet.eurcBalance < totalNeeded) {
          return NextResponse.json(
            { error: `Insufficient EURC treasury balance. Required: ${totalNeeded.toFixed(2)} EURC, Available: ${wallet.eurcBalance.toFixed(2)} EURC.` },
            { status: 400 }
          );
        }
      }

      // Transition status to approved
      batch.status = "approved";
      batch.redemptionNote = redemptionNote;

      const tokenAddress = batch.token === "USDC"
        ? "0x3600000000000000000000000000000000000000"
        : "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

      const updatedPayouts: Payout[] = [];

      for (const p of batch.payouts) {
        try {
          const transferResponse = await client.createTransaction({
            walletId: config.walletId,
            tokenAddress,
            destinationAddress: p.address,
            amount: [p.amount],
            fee: {
              type: "level",
              config: { feeLevel: "MEDIUM" },
            },
          });

          const transactionId = transferResponse.data?.id;
          if (!transactionId) {
            throw new Error("Transaction ID not returned from Circle API");
          }

          // Poll transaction status to get the real hash
          let txHash = "";
          let retries = 15;
          while (retries > 0 && !txHash) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const statusRes = await client.getTransaction({ id: transactionId });
            const tx = statusRes.data?.transaction;
            if (tx?.txHash) {
              txHash = tx.txHash;
            } else if (tx?.state === "FAILED" || tx?.state === "DENIED") {
              break;
            }
            retries--;
          }

          updatedPayouts.push({
            ...p,
            status: txHash ? ("success" as const) : ("failed" as const),
            txHash: txHash || undefined
          });
        } catch (e: any) {
          console.error(`Failed to disburse payout to ${p.address}:`, e);
          updatedPayouts.push({
            ...p,
            status: "failed" as const
          });
        }
      }

      batch.payouts = updatedPayouts;
      batch.status = batch.payouts.some(p => p.status === "failed") ? "failed" : "completed";

      // Remove from pending list
      localPendingBatches = localPendingBatches.filter((b) => b.id !== batchId);

      logger.info({
        category: "TRANSACTION",
        event: "PAYOUT_BATCH_APPROVED",
        message: `Payout batch ${batch.id} processed with status: ${batch.status}`,
        ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
        metadata: {
          batchId: batch.id,
          status: batch.status,
          successCount: batch.payouts.filter(p => p.status === "success").length,
          failedCount: batch.payouts.filter(p => p.status === "failed").length,
        }
      });

      return NextResponse.json({
        success: true,
        message: redemptionNote
          ? `Batch approved successfully. ${redemptionNote}`
          : "Developer-Controlled batch disbursal executed successfully.",
        batch
      });
    }

    if (action === "reject") {
      batch.status = "failed";
      batch.payouts = batch.payouts.map(p => ({ ...p, status: "failed" }));

      // Remove from pending list
      localPendingBatches = localPendingBatches.filter((b) => b.id !== batchId);

      logger.warn({
        category: "TRANSACTION",
        event: "PAYOUT_BATCH_REJECTED",
        message: `Payout batch ${batch.id} was rejected by checker`,
        ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
        metadata: {
          batchId: batch.id,
        }
      });

      return NextResponse.json({
        success: true,
        message: "Batch rejected and cancelled.",
        batch
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
