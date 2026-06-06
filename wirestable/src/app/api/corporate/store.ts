// Centralized mock corporate treasury database store for sandbox environment
export interface CorporateWalletState {
  address: string;
  usdcBalance: number;
  eurcBalance: number;
  usycBalance: number;
  autoSweep: boolean;
  accruedYield: number;
  status: "active" | "inactive";
  walletSetId: string;
  created: boolean;
  lastYieldCalculation: number;
}

export const APY_RATE = 0.0515; // 5.15% APY for USYC Yield

// Set default wallet state
export let corporateWallet: CorporateWalletState = {
  address: "0xa2b22b2b22b2b2b22b2b2b22b2b2b22b2b2b2b",
  usdcBalance: 150000.00,
  eurcBalance: 85000.00,
  usycBalance: 0.00,
  autoSweep: false,
  accruedYield: 0.00,
  status: "active",
  walletSetId: "ws_corp_default_init",
  created: true,
  lastYieldCalculation: Date.now()
};

export function updateWallet(updates: Partial<CorporateWalletState>) {
  corporateWallet = {
    ...corporateWallet,
    ...updates
  };
  return corporateWallet;
}

// Calculates and accrues yield on USYC balance based on elapsed time
export function calculateAndAccrueYield() {
  const now = Date.now();
  if (corporateWallet.usycBalance > 0) {
    const elapsedSeconds = (now - corporateWallet.lastYieldCalculation) / 1000;
    // Standard continuous compounding or simple second-rate calculations:
    const yieldPerSecond = (corporateWallet.usycBalance * APY_RATE) / (365 * 24 * 3600);
    const addedYield = yieldPerSecond * elapsedSeconds;
    
    corporateWallet.accruedYield += addedYield;
    // The USYC token itself increases in value/balance or yields accrued balance
    corporateWallet.usycBalance += addedYield;
  }
  corporateWallet.lastYieldCalculation = now;
  return corporateWallet;
}
