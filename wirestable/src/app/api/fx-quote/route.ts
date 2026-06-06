import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const amountIn = searchParams.get("amountIn");
    const tokenIn = searchParams.get("tokenIn") || "USDC";
    const tokenOut = searchParams.get("tokenOut") || "EURC";

    if (!amountIn) {
      return NextResponse.json({ error: "Missing amountIn parameter" }, { status: 400 });
    }

    const numericAmount = parseFloat(amountIn);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Invalid amountIn" }, { status: 400 });
    }

    const apiKey = process.env.CIRCLE_API_KEY;

    // Real StableFX API Call if API Key exists
    if (apiKey && apiKey !== "simulated") {
      try {
        const url = `https://api.circle.com/v1/stablefx/quotes?sellAsset=${tokenIn}&buyAsset=${tokenOut}&sellAmount=${amountIn}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          const data = await res.json();
          // Normalize API response to include rate, buyAmount, fee, spread, slippage, expiresAt
          const rate = data.rate || data.price || "0.92";
          const buyAmount = data.buyAmount || (numericAmount * parseFloat(rate)).toFixed(6);
          return NextResponse.json({
            id: data.id || `fxq_${Math.random().toString(36).substring(2, 11)}`,
            pair: `${tokenIn}/${tokenOut}`,
            rate,
            sellAmount: amountIn,
            buyAmount,
            fee: data.fee || (numericAmount * 0.001).toFixed(6),
            spread: data.spread || "0.0005",
            slippage: data.slippage || "0.0002",
            expiresIn: 30,
            expiresAt: Date.now() + 30000
          });
        }
        console.warn("Circle API StableFX quote failed with status:", res.status);
      } catch (fetchErr) {
        console.error("Circle API StableFX fetch error:", fetchErr);
      }
    }

    // High fidelity simulation mode (1 USDC = 0.9245 EURC, 1 EURC = 1.0817 USDC)
    const rate = tokenIn === "USDC" ? 0.9245 : 1.0817;
    const buyAmount = (numericAmount * rate).toFixed(6);
    const fee = (numericAmount * 0.0015).toFixed(6); // 0.15% fee
    const spread = "0.0005"; // 0.05%
    const slippage = "0.001"; // 0.1% slippage protection

    return NextResponse.json({
      id: `fxq_${Math.random().toString(36).substring(2, 11)}`,
      pair: `${tokenIn}/${tokenOut}`,
      rate: rate.toString(),
      sellAmount: amountIn,
      buyAmount,
      fee,
      spread,
      slippage,
      expiresIn: 30,
      expiresAt: Date.now() + 30000
    });
  } catch (err: any) {
    console.error("StableFX quote api route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
