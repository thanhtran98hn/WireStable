import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { userToken, walletId, destinationAddress, amount, tokenId } = await req.json();

    if (!userToken || !walletId || !destinationAddress || !amount || !tokenId) {
      return NextResponse.json(
        { error: "Missing required fields: userToken, walletId, destinationAddress, amount, tokenId." },
        { status: 400 }
      );
    }

    const circleApiKey = process.env.CIRCLE_API_KEY;

    console.log(`[Circle UCW Challenge] Initiating transfer challenge: Wallet ${walletId} -> ${destinationAddress} (Amount: ${amount})`);

    // Fallback simulation mode if credentials are missing
    if (!circleApiKey) {
      console.warn("[Circle UCW Challenge] CIRCLE_API_KEY is missing. Running in Simulation mode.");
      return NextResponse.json({
        simulated: true,
        challengeId: crypto.randomUUID(),
        message: "Successfully generated simulated transfer challenge (Simulation Mode)."
      });
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${circleApiKey}`,
      "X-User-Token": userToken,
    };

    const payload = {
      idempotencyKey: crypto.randomUUID(),
      walletId,
      destinationAddress,
      tokenId,
      amounts: [amount],
      feeLevel: "MEDIUM"
    };

    const res = await fetch("https://api.circle.com/v1/w3s/user/transactions/transfer", {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to create transfer challenge: ${JSON.stringify(data)}` },
        { status: res.status }
      );
    }

    return NextResponse.json({
      simulated: false,
      challengeId: data.data?.challengeId,
      ...data.data
    });
  } catch (error: any) {
    console.error("[Circle UCW Challenge] Endpoint Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
