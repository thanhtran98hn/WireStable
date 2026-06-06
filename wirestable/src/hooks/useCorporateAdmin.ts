"use client";

import { useState, useCallback, useEffect } from "react";
import type { Payout, PayoutBatch } from "@/app/api/corporate/payouts/route";

export interface TreasuryWallet {
  address: string;
  usdcBalance: string;
  eurcBalance: string;
  usycBalance?: string;
  autoSweep?: boolean;
  accruedYield?: string;
  status: "active" | "inactive";
  walletSetId: string;
  created: boolean;
}

export function useCorporateAdmin() {
  const [wallet, setWallet] = useState<TreasuryWallet | null>(null);
  const [batches, setBatches] = useState<PayoutBatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Yield tracking states
  const [autoSweep, setAutoSweep] = useState<boolean>(false);
  const [usycBalance, setUsycBalance] = useState<string>("0.00");
  const [accruedYield, setAccruedYield] = useState<string>("0.000000");

  // Fetch treasury wallet details
  const fetchTreasuryWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/corporate/wallet");
      if (!res.ok) throw new Error("Failed to fetch treasury wallet");
      const data = await res.json();
      setWallet(data);
      setAutoSweep(data.autoSweep || false);
      setUsycBalance(data.usycBalance || "0.00");
      setAccruedYield(data.accruedYield || "0.000000");
    } catch (err: any) {
      setError(err.message || "Failed to query wallet details");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize treasury wallet (Developer-Controlled Wallet)
  const initializeTreasuryWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/corporate/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Failed to generate treasury wallet");
      const data = await res.json();
      setWallet(data.wallet);
      setAutoSweep(data.wallet.autoSweep || false);
      setUsycBalance(data.wallet.usycBalance || "0.00");
      setAccruedYield(data.wallet.accruedYield || "0.000000");
      return data.wallet;
    } catch (err: any) {
      setError(err.message || "Failed to generate wallet");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch payout batches
  const fetchBatches = useCallback(async () => {
    try {
      const res = await fetch("/api/corporate/payouts");
      if (!res.ok) throw new Error("Failed to fetch payout batches");
      const data = await res.json();
      setBatches(data);
    } catch (err: any) {
      console.error("Error fetching batches:", err);
    }
  }, []);

  // Submit new payout batch (Maker Step)
  const submitBatch = useCallback(async (payouts: Payout[], token: "USDC" | "EURC" = "USDC") => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/corporate/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payouts, token })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit payout batch");
      }
      const data = await res.json();
      await fetchBatches();
      await fetchTreasuryWallet(); // Update balances
      return data.batch;
    } catch (err: any) {
      setError(err.message || "Failed to submit batch");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBatches, fetchTreasuryWallet]);

  // Approve and execute payout batch (Checker Step)
  const approveBatch = useCallback(async (batchId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/corporate/payouts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, action: "approve" })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to approve batch");
      }
      const data = await res.json();
      await fetchBatches();
      await fetchTreasuryWallet();
      return data.batch;
    } catch (err: any) {
      setError(err.message || "Failed to approve batch");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBatches, fetchTreasuryWallet]);

  // Reject / Cancel batch
  const rejectBatch = useCallback(async (batchId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/corporate/payouts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, action: "reject" })
      });
      if (!res.ok) throw new Error("Failed to reject batch");
      await fetchBatches();
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to reject batch");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBatches]);

  // Toggle Auto-Sweep rules via API
  const toggleAutoSweep = useCallback(async (enabled: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/corporate/sweep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoSweep: enabled })
      });
      if (!res.ok) throw new Error("Failed to configure auto-sweep rule");
      const data = await res.json();
      setAutoSweep(data.autoSweep);
      setUsycBalance(data.usycBalance);
      setAccruedYield(data.accruedYield);
      await fetchTreasuryWallet(); // Update USDC and USYC balances
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to toggle auto-sweep");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTreasuryWallet]);

  // Client-side CSV Parser
  const parseCSV = useCallback((text: string): { recipientName: string; address: string; amount: string }[] => {
    if (!text) return [];
    
    const lines = text.split(/\r?\n/);
    const result: { recipientName: string; address: string; amount: string }[] = [];
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    
    const nameIndex = headers.indexOf("recipientname") !== -1 ? headers.indexOf("recipientname") : headers.indexOf("name");
    const addressIndex = headers.indexOf("address");
    const amountIndex = headers.indexOf("amount");

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].trim();
      if (!currentLine) continue;

      const cols = currentLine.split(",").map(c => c.trim());
      if (cols.length < 2) continue;

      const recipientName = nameIndex !== -1 && cols[nameIndex] ? cols[nameIndex] : "Contractor";
      const address = addressIndex !== -1 && cols[addressIndex] ? cols[addressIndex] : cols[0];
      const amount = amountIndex !== -1 && cols[amountIndex] ? cols[amountIndex] : cols[1];

      if (address && amount) {
        result.push({ recipientName, address, amount });
      }
    }
    return result;
  }, []);

  // Fetch initial details
  useEffect(() => {
    fetchTreasuryWallet();
    fetchBatches();
  }, [fetchTreasuryWallet, fetchBatches]);

  // Live yield-ticking effect
  useEffect(() => {
    const usycAmount = parseFloat(usycBalance);
    if (usycAmount <= 0) return;

    const interval = setInterval(() => {
      const yieldPerSecond = (usycAmount * 0.0515) / (365 * 24 * 3600);
      setAccruedYield(prev => (parseFloat(prev) + yieldPerSecond).toFixed(8));
    }, 1000);

    return () => clearInterval(interval);
  }, [usycBalance]);

  return {
    wallet,
    batches,
    isLoading,
    error,
    autoSweep,
    usycBalance,
    accruedYield,
    initializeTreasuryWallet,
    fetchTreasuryWallet,
    fetchBatches,
    submitBatch,
    approveBatch,
    rejectBatch,
    toggleAutoSweep,
    parseCSV
  };
}
