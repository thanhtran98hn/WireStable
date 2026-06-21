import { NextResponse } from "next/server";
import crypto from "crypto";
import { fetchWithRetry } from "@/utils/apiHelper";

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
    const circleApiUrl = process.env.CIRCLE_API_URL || "https://api.circle.com";

    console.log(`[Circle UCW Challenge] Initiating transfer challenge: Wallet ${walletId} -> ${destinationAddress} (Amount: ${amount})`);

    if (!circleApiKey) {
      return NextResponse.json({
        error: "Circle API key is not configured."
      }, { status: 500 });
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

    const res = await fetchWithRetry(`${circleApiUrl}/v1/w3s/user/transactions/transfer`, {
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
