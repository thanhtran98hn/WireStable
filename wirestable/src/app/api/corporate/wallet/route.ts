import { NextRequest, NextResponse } from "next/server";
import { getCorporateWallet, getWalletConfig } from "../store";

export async function GET(request: NextRequest) {
  try {
    const wallet = await getCorporateWallet();
    return NextResponse.json({
      address: wallet.address,
      usdcBalance: wallet.usdcBalance.toFixed(2),
      eurcBalance: wallet.eurcBalance.toFixed(2),
      usycBalance: wallet.usycBalance.toFixed(2),
      autoSweep: wallet.autoSweep,
      accruedYield: wallet.accruedYield.toFixed(6),
      status: wallet.status,
      walletSetId: wallet.walletSetId,
      created: wallet.created
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Return existing config or defaults from store
    const config = getWalletConfig();
    const wallet = await getCorporateWallet();

    return NextResponse.json({
      success: true,
      message: "Circle Developer-Controlled Wallet synchronized on Arc Testnet.",
      wallet: {
        address: wallet.address,
        usdcBalance: wallet.usdcBalance.toFixed(2),
        eurcBalance: wallet.eurcBalance.toFixed(2),
        usycBalance: wallet.usycBalance.toFixed(2),
        autoSweep: wallet.autoSweep,
        accruedYield: wallet.accruedYield.toFixed(6),
        status: wallet.status,
        walletSetId: wallet.walletSetId,
        created: wallet.created
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
