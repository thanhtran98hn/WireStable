import { NextRequest, NextResponse } from "next/server";

// Session-level in-memory storage for demonstration persistence
let corporateWallet = {
  address: "",
  usdcBalance: "0.00",
  eurcBalance: "0.00",
  status: "inactive",
  walletSetId: "",
  created: false
};

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(corporateWallet);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Generate a developer-controlled wallet on Arc
    corporateWallet = {
      address: "0xa2b22b2b22b2b2b22b2b2b2b22b2b2b22b2b2b2b", // Simulated Circle Dev-Controlled Wallet Address
      usdcBalance: "150000.00",
      eurcBalance: "85000.00",
      status: "active",
      walletSetId: `ws_corp_${Math.random().toString(36).substring(2, 11)}`,
      created: true
    };

    return NextResponse.json({
      success: true,
      message: "Circle Developer-Controlled Wallet generated on Arc Testnet.",
      wallet: corporateWallet
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
