"use client";

import { useState, useEffect, useCallback } from "react";

export interface FXQuote {
  id: string;
  pair: string;
  rate: string;
  sellAmount: string;
  buyAmount: string;
  fee: string;
  spread: string;
  slippage: string;
  expiresIn: number;
  expiresAt: number;
}

export function useStableFX() {
  const [activeQuote, setActiveQuote] = useState<FXQuote | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Expiration countdown loop
  useEffect(() => {
    if (!activeQuote) {
      setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((activeQuote.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        setActiveQuote(null);
        setError("Quote has expired. Please request a new quote.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeQuote]);

  const fetchQuote = useCallback(async (
    amountIn: string,
    tokenIn: "USDC" | "EURC",
    tokenOut: "USDC" | "EURC"
  ) => {
    setIsFetching(true);
    setError(null);
    try {
      const res = await fetch(`/api/fx-quote?amountIn=${amountIn}&tokenIn=${tokenIn}&tokenOut=${tokenOut}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch StableFX quote");
      }
      const data: FXQuote = await res.json();
      setActiveQuote(data);
      setTimeLeft(Math.max(0, Math.ceil((data.expiresAt - Date.now()) / 1000)));
      return data;
    } catch (err: any) {
      setError(err.message || "Something went wrong fetching quote");
      setActiveQuote(null);
      return null;
    } finally {
      setIsFetching(false);
    }
  }, []);

  const clearQuote = useCallback(() => {
    setActiveQuote(null);
    setTimeLeft(0);
    setError(null);
  }, []);

  return {
    activeQuote,
    timeLeft,
    isFetching,
    error,
    fetchQuote,
    clearQuote,
  };
}
