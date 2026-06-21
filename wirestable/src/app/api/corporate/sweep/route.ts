import { NextRequest, NextResponse } from "next/server";
import { getCorporateWallet, updateWallet } from "../store";

export async function GET(request: NextRequest) {
  try {
    const wallet = await getCorporateWallet();
    return NextResponse.json({
      success: true,
      autoSweep: wallet.autoSweep,
      usdcBalance: wallet.usdcBalance.toFixed(2),
      usycBalance: wallet.usycBalance.toFixed(2),
      accruedYield: wallet.accruedYield.toFixed(6)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { autoSweep } = await request.json();

    let wallet = await getCorporateWallet();

    if (autoSweep === true && !wallet.autoSweep) {
      // Execute the sweep: Sweep 80% of idle USDC into USYC
      const idleUsdc = wallet.usdcBalance;
      const sweptAmount = idleUsdc * 0.8;
      
      wallet = await updateWallet({
        autoSweep: true,
        usycBalance: wallet.usycBalance + sweptAmount
      });
    } else if (autoSweep === false && wallet.autoSweep) {
      // Redeem all USYC back into USDC
      wallet = await updateWallet({
        autoSweep: false,
        usycBalance: 0.00
      });
    }

    return NextResponse.json({
      success: true,
      message: autoSweep 
        ? `Auto-sweep enabled. Swept 80% of idle USDC into yield-bearing USYC.` 
        : `Auto-sweep disabled. Redeemed all USYC assets back to liquid USDC.`,
      autoSweep: wallet.autoSweep,
      usdcBalance: wallet.usdcBalance.toFixed(2),
      usycBalance: wallet.usycBalance.toFixed(2),
      accruedYield: wallet.accruedYield.toFixed(6)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
