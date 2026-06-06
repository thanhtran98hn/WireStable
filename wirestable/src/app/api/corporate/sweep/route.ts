import { NextRequest, NextResponse } from "next/server";
import { corporateWallet, updateWallet, calculateAndAccrueYield } from "../store";

export async function GET(request: NextRequest) {
  try {
    calculateAndAccrueYield();
    return NextResponse.json({
      success: true,
      autoSweep: corporateWallet.autoSweep,
      usdcBalance: corporateWallet.usdcBalance.toFixed(2),
      usycBalance: corporateWallet.usycBalance.toFixed(2),
      accruedYield: corporateWallet.accruedYield.toFixed(6)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { autoSweep } = await request.json();

    calculateAndAccrueYield();

    if (autoSweep === true && !corporateWallet.autoSweep) {
      // Execute the sweep: Sweep 80% of idle USDC into USYC
      const idleUsdc = corporateWallet.usdcBalance;
      const sweptAmount = idleUsdc * 0.8;
      
      updateWallet({
        autoSweep: true,
        usdcBalance: idleUsdc - sweptAmount,
        usycBalance: corporateWallet.usycBalance + sweptAmount
      });
    } else if (autoSweep === false && corporateWallet.autoSweep) {
      // Redeem all USYC back into USDC
      const currentUsyc = corporateWallet.usycBalance;
      updateWallet({
        autoSweep: false,
        usdcBalance: corporateWallet.usdcBalance + currentUsyc,
        usycBalance: 0.00
      });
    }

    return NextResponse.json({
      success: true,
      message: autoSweep 
        ? `Auto-sweep enabled. Swept 80% of idle USDC into yield-bearing USYC.` 
        : `Auto-sweep disabled. Redeemed all USYC assets back to liquid USDC.`,
      autoSweep: corporateWallet.autoSweep,
      usdcBalance: corporateWallet.usdcBalance.toFixed(2),
      usycBalance: corporateWallet.usycBalance.toFixed(2),
      accruedYield: corporateWallet.accruedYield.toFixed(6)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
