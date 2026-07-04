"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type TxType = "bridge" | "escrow" | "sweep" | "send";
export type TxStatus = "pending" | "success" | "failed";

export interface TransactionItem {
  id: string;
  type: TxType;
  status: TxStatus;
  description: string;
  step?: string;
  txHash?: string | null;
  error?: string | null;
  timestamp: number;
}

export interface TxRegistryContextType {
  transactions: TransactionItem[];
  addTransaction: (tx: Omit<TransactionItem, "timestamp">) => void;
  updateTransaction: (id: string, updates: Partial<Omit<TransactionItem, "id" | "timestamp">>) => void;
  removeTransaction: (id: string) => void;
  clearAll: () => void;
}

const TxRegistryContext = createContext<TxRegistryContextType | undefined>(undefined);

export function TxRegistryProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  // Hydrate states from localStorage for persistence across page loads
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wirestable_active_txs");
      if (saved) {
        setTransactions(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to restore transaction states", e);
    }
  }, []);

  const saveToStorage = (list: TransactionItem[]) => {
    try {
      localStorage.setItem("wirestable_active_txs", JSON.stringify(list));
    } catch (e) {
      console.error("Failed to save transaction states", e);
    }
  };

  const addTransaction = (tx: Omit<TransactionItem, "timestamp">) => {
    setTransactions((prev) => {
      const exists = prev.find((item) => item.id === tx.id);
      if (exists) return prev;
      const newList = [...prev, { ...tx, timestamp: Date.now() }];
      saveToStorage(newList);
      return newList;
    });
  };

  const updateTransaction = (id: string, updates: Partial<Omit<TransactionItem, "id" | "timestamp">>) => {
    setTransactions((prev) => {
      const newList = prev.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      });
      saveToStorage(newList);
      return newList;
    });
  };

  const removeTransaction = (id: string) => {
    setTransactions((prev) => {
      const newList = prev.filter((item) => item.id !== id);
      saveToStorage(newList);
      return newList;
    });
  };

  const clearAll = () => {
    setTransactions([]);
    try {
      localStorage.removeItem("wirestable_active_txs");
    } catch {}
  };

  return (
    <TxRegistryContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        removeTransaction,
        clearAll,
      }}
    >
      {children}
    </TxRegistryContext.Provider>
  );
}

export function useTxRegistry() {
  const context = useContext(TxRegistryContext);
  if (!context) {
    throw new Error("useTxRegistry must be used within a TxRegistryProvider");
  }
  return context;
}
