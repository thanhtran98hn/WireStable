import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const amountStr = searchParams.get("amount") || "1000";
  const targetRateStr = searchParams.get("targetRate") || "0.9245";
  
  const amount = parseFloat(amountStr);
  const targetRate = parseFloat(targetRateStr);
  
  // High fidelity spot rate simulation: 0.9245
  const spotRate = 0.9245;
  
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
    const targetRate = parseFloat(body.targetRate || "0.9245");

    const spotRate = 0.9245;
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
