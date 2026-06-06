import { NextRequest, NextResponse } from "next/server";

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
}

// In-memory persistence for payout batches
let payoutBatches: PayoutBatch[] = [];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(payoutBatches);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

      // Transition status to approved
      batch.status = "approved";

      // Execute mock sequential transfers via developer-controlled wallet
      // We will generate simulated tx hashes for each payment and set them to success
      const updatedPayouts = batch.payouts.map((p) => {
        const simulatedHash = `0x${Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("")}`;
        return {
          ...p,
          status: "success" as const,
          txHash: simulatedHash
        };
      });

      batch.payouts = updatedPayouts;
      batch.status = "completed";

      return NextResponse.json({
        success: true,
        message: "Developer-Controlled batch disbarsal executed successfully.",
        batch
      });
    }

    if (action === "reject") {
      batch.status = "failed";
      batch.payouts = batch.payouts.map(p => ({ ...p, status: "failed" }));
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
