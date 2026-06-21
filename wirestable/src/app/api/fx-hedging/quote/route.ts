import { NextResponse } from "next/server";

async function getLiveSpotRate(): Promise<number> {
  try {
    const cbRes = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=USDC");
    if (cbRes.ok) {
      const cbData = await cbRes.json();
      const usdcToEur = parseFloat(cbData.data?.rates?.EUR);
      if (usdcToEur && !isNaN(usdcToEur)) {
        return usdcToEur;
      }
    }
  } catch (err) {
    console.warn("Coinbase API spot rate fetch for hedging failed:", err);
  }
  return 0.9245; // safe fallback
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const amountStr = searchParams.get("amount") || "1000";
  
  const amount = parseFloat(amountStr);
  const spotRate = await getLiveSpotRate();
  
  const targetRateStr = searchParams.get("targetRate") || spotRate.toString();
  const targetRate = parseFloat(targetRateStr);
  
  // Premium formula: 0.15% flat + deviation surcharge if targetRate > spotRate
  const flatFee = amount * 0.0015;
  const deviation = targetRate > spotRate ? (targetRate - spotRate) : 0;
  const deviationSurcharge = amount * deviation;
  const totalPremium = flatFee + deviationSurcharge;

  const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours lock

  return NextResponse.json({
    success: true,
    amount,
    spotRate,
    targetRate,
    premium: totalPremium,
    expiration: new Date(expirationTime).toISOString(),
    corridor: "USDC-EURC",
    poolMetrics: {
      tvl: 450000,
      vol24h: 120000,
      apy: 12.45
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = parseFloat(body.amount || "1000");
    const spotRate = await getLiveSpotRate();
    const targetRate = parseFloat(body.targetRate || spotRate.toString());

    const flatFee = amount * 0.0015;
    const deviation = targetRate > spotRate ? (targetRate - spotRate) : 0;
    const deviationSurcharge = amount * deviation;
    const totalPremium = flatFee + deviationSurcharge;

    const expirationTime = Date.now() + 24 * 60 * 60 * 1000;

    return NextResponse.json({
      success: true,
      amount,
      spotRate,
      targetRate,
      premium: totalPremium.toFixed(4),
      expiration: new Date(expirationTime).toISOString(),
      corridor: "USDC-EURC"
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
  }
}
