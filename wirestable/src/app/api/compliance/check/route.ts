import { NextResponse } from "next/server";

// Mock list of sanctioned or restricted addresses (lowercase)
const RESTRICTED_ADDRESSES = [
  "0x0000000000000000000000000000000000000000",
  "0x7f0cbcf157624554a4427b74d3dc6a9e80000000",
  "0x1111111111111111111111111111111111111111",
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // Mock high-risk mixer
];

export async function POST(request: Request) {
  try {
    const { address, amount, senderAddress, senderEmail, type } = await request.json();

    if (!address) {
      return NextResponse.json({ success: false, error: "Recipient address is required" }, { status: 400 });
    }

    const cleanAddress = address.trim().toLowerCase();
    const parsedAmount = parseFloat(amount || "0");

    let riskScore = 10;
    let reason = "Standard low-risk corridor transaction.";
    let blocked = false;

    // 1. Sanctions list check
    if (RESTRICTED_ADDRESSES.includes(cleanAddress)) {
      riskScore = 100;
      reason = "Recipient address matches an OFAC sanctioned or high-risk restricted entity.";
      blocked = true;
    } 
    // 2. High-value thresholds (e.g. transfers >= 10,000 USDC)
    else if (parsedAmount >= 10000) {
      riskScore = 85;
      reason = "Transaction amount meets or exceeds the regulatory reporting threshold (>= 10,000 USDC).";
      blocked = true;
    }
    // 3. Moderate transactions (e.g. transfers >= 5,000 USDC)
    else if (parsedAmount >= 5000) {
      riskScore = 55;
      reason = "Enhanced due diligence threshold met (>= 5,000 USDC). Transaction requires verification indicators.";
    }
    // 4. Base corridor calculation
    else if (parsedAmount > 1000) {
      riskScore = 30;
      reason = "Standard remittance. Risk parameters within standard limits.";
    }

    // Double check threshold logic
    if (riskScore >= 75) {
      blocked = true;
    }

    return NextResponse.json({
      success: true,
      riskScore,
      reason,
      blocked,
      checkedAddress: address,
      senderAddress: senderAddress || "0xUnknownSender",
      senderEmail: senderEmail || "user@wirestable.internal",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
