import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import fs from "fs";
import path from "path";

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

// Default wallet coordinates
const DEFAULT_WALLET = {
  walletSetId: "fcfce98a-ab75-535b-8bcf-f2cf7ef54279",
  walletId: "13cc6087-dc7a-56d3-96ad-0dc26279b3cb",
  address: "0xaba693f488d23109bbb980be27af15c553735245"
};

const walletInfoPath = path.resolve(process.cwd(), "corporate_wallet.json");
const statePath = path.resolve(process.cwd(), "corporate_state.json");

export function getClient() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  if (!apiKey || !entitySecret) {
    throw new Error("Circle Developer Controlled Wallet credentials (CIRCLE_API_KEY, CIRCLE_ENTITY_SECRET) are missing.");
  }
  return initiateDeveloperControlledWalletsClient({
    apiKey,
    entitySecret,
  });
}

export function getWalletConfig() {
  if (fs.existsSync(walletInfoPath)) {
    try {
      return JSON.parse(fs.readFileSync(walletInfoPath, "utf-8"));
    } catch (e) {
      console.error("Failed to read corporate_wallet.json:", e);
    }
  }
  return DEFAULT_WALLET;
}

export function getPersistentState() {
  const defaultState = {
    autoSweep: true,
    usycBalance: 0.0,
    accruedYield: 0.0,
    lastYieldCalculation: Date.now()
  };

  if (fs.existsSync(statePath)) {
    try {
      return {
        ...defaultState,
        ...JSON.parse(fs.readFileSync(statePath, "utf-8"))
      };
    } catch (e) {
      console.error("Failed to read corporate_state.json:", e);
    }
  }
  return defaultState;
}

export function savePersistentState(state: any) {
  try {
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write corporate_state.json:", e);
  }
}

export async function getCorporateWallet(): Promise<CorporateWalletState> {
  let config = getWalletConfig();
  const state = getPersistentState();

  let usdcBalance = 0;
  let eurcBalance = 0;
  let walletValid = false;

  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (apiKey && entitySecret) {
    try {
      const client = getClient();
      const balanceResponse = await client.getWalletTokenBalance({
        id: config.walletId
      });
      const balances = balanceResponse.data?.tokenBalances || [];
      const usdc = balances.find((b: any) => b.token.symbol === "USDC");
      const eurc = balances.find((b: any) => b.token.symbol === "EURC");

      if (usdc) usdcBalance = parseFloat(usdc.amount);
      if (eurc) eurcBalance = parseFloat(eurc.amount);
      walletValid = true;
    } catch (err) {
      console.error("Failed to fetch corporate wallet balances from Circle API. It might be invalid or belong to a different account:", err);
    }

    // Auto-create wallet if current config is invalid/inaccessible
    if (!walletValid) {
      try {
        console.log("Corporate wallet not found or inaccessible under new credentials. Auto-generating new treasury wallet on ARC-TESTNET...");
        const client = getClient();
        
        // 1. Create a wallet set
        const walletSetResponse = await client.createWalletSet({
          name: "Corporate Treasury WalletSet",
        });
        const newWalletSetId = walletSetResponse.data?.walletSet?.id;
        
        if (newWalletSetId) {
          // 2. Create wallet (SCA on ARC-TESTNET)
          const walletsResponse = await client.createWallets({
            accountType: "SCA",
            blockchains: ["ARC-TESTNET"],
            count: 1,
            walletSetId: newWalletSetId,
          });
          
          const newWallet = walletsResponse.data?.wallets?.[0];
          if (newWallet) {
            const newConfig = {
              walletSetId: newWalletSetId,
              walletId: newWallet.id,
              address: newWallet.address
            };
            fs.writeFileSync(walletInfoPath, JSON.stringify(newConfig, null, 2), "utf-8");
            console.log("Successfully created and saved new Corporate Treasury Wallet:", newConfig);
            
            config = newConfig;
            usdcBalance = 0;
            eurcBalance = 0;
            walletValid = true;
          }
        }
      } catch (createErr) {
        console.error("Failed to automatically generate corporate wallet:", createErr);
      }
    }
  }

  if (!apiKey || !entitySecret) {
    throw new Error("Circle Developer Controlled Wallet credentials (CIRCLE_API_KEY, CIRCLE_ENTITY_SECRET) are missing. Please configure them in production environment.");
  }

  // Adjust balance if swept into yield
  let adjustedUsdc = usdcBalance;
  if (state.autoSweep && state.usycBalance > 0) {
    adjustedUsdc = Math.max(0, usdcBalance - state.usycBalance);
  }

  // Accrue Yield
  const now = Date.now();
  let accruedYield = state.accruedYield;
  let usycBalance = state.usycBalance;

  if (usycBalance > 0) {
    const elapsedSeconds = (now - state.lastYieldCalculation) / 1000;
    const yieldPerSecond = (usycBalance * APY_RATE) / (365 * 24 * 3600);
    const addedYield = yieldPerSecond * elapsedSeconds;

    accruedYield += addedYield;
    usycBalance += addedYield;

    // Save back immediately
    savePersistentState({
      ...state,
      accruedYield,
      usycBalance,
      lastYieldCalculation: now
    });
  } else {
    savePersistentState({
      ...state,
      lastYieldCalculation: now
    });
  }

  return {
    address: config.address,
    usdcBalance: adjustedUsdc,
    eurcBalance,
    usycBalance,
    autoSweep: state.autoSweep,
    accruedYield,
    status: "active",
    walletSetId: config.walletSetId,
    created: true,
    lastYieldCalculation: now
  };
}

export async function updateWallet(updates: Partial<CorporateWalletState>) {
  const state = getPersistentState();
  const newPersistentState = { ...state };

  if (updates.autoSweep !== undefined) newPersistentState.autoSweep = updates.autoSweep;
  if (updates.usycBalance !== undefined) newPersistentState.usycBalance = updates.usycBalance;
  if (updates.accruedYield !== undefined) newPersistentState.accruedYield = updates.accruedYield;
  
  newPersistentState.lastYieldCalculation = Date.now();
  savePersistentState(newPersistentState);

  return getCorporateWallet();
}

export async function calculateAndAccrueYield() {
  return getCorporateWallet();
}
