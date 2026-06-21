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

// In-memory persistence for payout batches
let payoutBatches: PayoutBatch[] = [
  {
    id: "batch_payroll_jun",
    totalAmount: "45000.00",
    token: "USDC",
    status: "completed",
    createdAt: Date.now() - 5 * 24 * 3600 * 1000, // 5 days ago
    payouts: [
      { recipientName: "Alice (Lead Engineer)", address: "0x73ff6d57ceac4c32c292ea842df4850ed4b7dfb7", amount: "15000.00", status: "success", txHash: "0xa2b22b2b22b2b2b22b2b2b22b2b2b22b2b2b2b11111111111111111111111111" },
      { recipientName: "Bob (Principal Designer)", address: "0x73977c088ddf7324317f2ccb2b2b1a134c6dbca8", amount: "12000.00", status: "success", txHash: "0x73977c088ddf7324317f2ccb2b2b1a134c6dbca8222222222222222222222222" },
      { recipientName: "Charlie (PM)", address: "0x5c79743c39385fb93c0d8df3c9ee5ff27fbc32a1", amount: "10000.00", status: "success", txHash: "0x5c79743c39385fb93c0d8df3c9ee5ff27fbc32a1333333333333333333333333" },
      { recipientName: "Diana (QA)", address: "0x2500000000000000000000000000000000000000", amount: "8000.00", status: "success", txHash: "0x2500000000000000000000000000000000000000444444444444444444444444" }
    ]
  },
  {
    id: "batch_contractors_eu",
    totalAmount: "8400.00",
    token: "EURC",
    status: "completed",
    createdAt: Date.now() - 12 * 24 * 3600 * 1000, // 12 days ago
    payouts: [
      { recipientName: "Emile (DevOps Paris)", address: "0xe2b22b2b22b2b2b22b2b2b22b2b2b22b2b2b2bee", amount: "4200.00", status: "success", txHash: "0x5c79743c39385fb93c0d8df3c9ee5ff27fbc32a1555555555555555555555555" },
      { recipientName: "Francois (Writer Brussels)", address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", amount: "4200.00", status: "success", txHash: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb922666666666666666666666666666" }
    ]
  },
  {
    id: "batch_marketing_q2",
    totalAmount: "12500.00",
    token: "USDC",
    status: "completed",
    createdAt: Date.now() - 20 * 24 * 3600 * 1000, // 20 days ago
    payouts: [
      { recipientName: "Inbound Marketing Inc", address: "0x73977c088ddf7324317f2ccb2b2b1a134c6dbca8", amount: "7500.00", status: "success", txHash: "0x73977c088ddf7324317f2ccb2b2b1a134c6dbca8777777777777777777777777" },
      { recipientName: "SMM Agency", address: "0xa2b22b2b22b2b2b22b2b2b22b2b2b22b2b2b2b8888888888888888888888888", amount: "5000.00", status: "success", txHash: "0xa2b22b2b22b2b2b22b2b2b22b2b2b22b2b2b2b9999999999999999999999999" }
    ]
  },
  {
    id: "batch_pending_payroll",
    totalAmount: "18450.00",
    token: "USDC",
    status: "pending_approval",
    createdAt: Date.now() - 4 * 3600 * 1000, // 4 hours ago
    payouts: [
      { recipientName: "George (Technical Writer)", address: "0x73977c088ddf7324317f2ccb2b2b1a134c6dbca8", amount: "6250.00", status: "pending" },
      { recipientName: "Hannah (Support Lead)", address: "0xa2b22b2b22b2b2b22b2b2b22b2b2b22b2b2b2b", amount: "5000.00", status: "pending" },
      { recipientName: "Ian (Developer Advocate)", address: "0x5c79743c39385fb93c0d8df3c9ee5ff27fbc32a1", amount: "7200.00", status: "pending" }
    ]
  }
];

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
    return NextResponse.json(payoutBatches);
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

    payoutBatches.push(newBatch);

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

    const batchIndex = payoutBatches.findIndex((b) => b.id === batchId);
    if (batchIndex === -1) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const batch = payoutBatches[batchIndex];

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
      const isSandboxMode = process.env.NODE_ENV !== "production" || !process.env.CIRCLE_API_KEY;

      for (const p of batch.payouts) {
        if (isSandboxMode) {
          // Generate a realistic mock txHash for sandbox verification
          const mockTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
          updatedPayouts.push({
            ...p,
            status: "success" as const,
            txHash: mockTxHash
          });
          continue;
        }

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
