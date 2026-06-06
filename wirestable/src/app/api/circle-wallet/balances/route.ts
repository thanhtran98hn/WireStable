import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get("walletId");
    const userToken = searchParams.get("userToken");

    if (!walletId || !userToken) {
      return NextResponse.json(
        { error: "Missing required parameters: walletId, userToken." },
        { status: 400 }
      );
    }

    const circleApiKey = process.env.CIRCLE_API_KEY;

    // Fallback simulation mode
    if (!circleApiKey) {
      console.warn("[Circle UCW Ballets] CIRCLE_API_KEY is missing. Running in Simulation mode.");
      return NextResponse.json({
        simulated: true,
        balances: [
          {
            amount: "1500.00",
            token: {
              id: "simulated_usdc_token_id",
              address: "0x0123456789abcdef0123456789abcdef01234567",
              symbol: "USDC",
              name: "USD Coin",
              decimals: 6,
              blockchain: "ARC-TESTNET"
            }
          }
        ]
      });
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${circleApiKey}`,
      "X-User-Token": userToken
    };

    const res = await fetch(`https://api.circle.com/v1/w3s/wallets/${walletId}/balances`, {
      method: "GET",
      headers
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch balances: ${JSON.stringify(data)}` },
        { status: res.status }
      );
    }

    return NextResponse.json({
      simulated: false,
      balances: data.data?.tokenBalances || []
    });
  } catch (error: any) {
    console.error("[Circle UCW Balances] Endpoint Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
