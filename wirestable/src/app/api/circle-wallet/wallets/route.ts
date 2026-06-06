import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userToken = searchParams.get("userToken");
    const userId = searchParams.get("userId");

    if (!userToken) {
      return NextResponse.json(
        { error: "Missing required parameter: userToken." },
        { status: 400 }
      );
    }

    const circleApiKey = process.env.CIRCLE_API_KEY;

    // Fallback simulation mode
    if (!circleApiKey) {
      console.warn("[Circle UCW Wallets] CIRCLE_API_KEY is missing. Running in Simulation mode.");
      return NextResponse.json({
        simulated: true,
        wallets: [
          {
            id: `simulated_wallet_id_${userId || "user"}`,
            address: "0x1234567890123456789012345678901234567890",
            blockchain: "ARC-TESTNET",
            state: "LIVE",
            accountType: "SCA",
            createDate: new Date().toISOString()
          }
        ]
      });
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${circleApiKey}`,
      "X-User-Token": userToken
    };

    const res = await fetch("https://api.circle.com/v1/w3s/wallets", {
      method: "GET",
      headers
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch wallets: ${JSON.stringify(data)}` },
        { status: res.status }
      );
    }

    return NextResponse.json({
      simulated: false,
      wallets: data.data?.wallets || []
    });
  } catch (error: any) {
    console.error("[Circle UCW Wallets] Endpoint Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
