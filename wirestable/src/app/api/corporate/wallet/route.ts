import { NextRequest, NextResponse } from "next/server";
import { corporateWallet, calculateAndAccrueYield, updateWallet } from "../store";

export async function GET(request: NextRequest) {
  try {
    calculateAndAccrueYield();
    return NextResponse.json({
      address: corporateWallet.address,
      usdcBalance: corporateWallet.usdcBalance.toFixed(2),
      eurcBalance: corporateWallet.eurcBalance.toFixed(2),
      usycBalance: corporateWallet.usycBalance.toFixed(2),
      autoSweep: corporateWallet.autoSweep,
      accruedYield: corporateWallet.accruedYield.toFixed(6),
      status: corporateWallet.status,
      walletSetId: corporateWallet.walletSetId,
      created: corporateWallet.created
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    updateWallet({
      address: "0xa2b22b2b22b2b2b22b2b2b22b2b2b22b2b2b2b",
      usdcBalance: 150000.00,
      eurcBalance: 85000.00,
      status: "active",
      walletSetId: `ws_corp_${Math.random().toString(36).substring(2, 11)}`,
      created: true
    });

    calculateAndAccrueYield();

    return NextResponse.json({
      success: true,
      message: "Circle Developer-Controlled Wallet generated on Arc Testnet.",
      wallet: {
        address: corporateWallet.address,
        usdcBalance: corporateWallet.usdcBalance.toFixed(2),
        eurcBalance: corporateWallet.eurcBalance.toFixed(2),
        usycBalance: corporateWallet.usycBalance.toFixed(2),
        autoSweep: corporateWallet.autoSweep,
        accruedYield: corporateWallet.accruedYield.toFixed(6),
        status: corporateWallet.status,
        walletSetId: corporateWallet.walletSetId,
        created: corporateWallet.created
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
