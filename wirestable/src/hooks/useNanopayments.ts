"use client";

import { useState, useEffect, useCallback } from "react";
import { privateKeyToAccount } from "viem/accounts";

export interface NanopayChannel {
  channelId: string;
  depositAmount: number;
  balance: number;
  cumulativeSpent: number;
  clientPrivateKey: string;
  clientPublicKey: string;
  isOpen: boolean;
}

const STORAGE_KEY = "wirestable_nanopay_channel";

export function useNanopayments() {
  const [channel, setChannel] = useState<NanopayChannel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load channel state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setChannel(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error loading nanopayment channel:", err);
    }
  }, []);

  // Save channel to localStorage whenever it changes
  const saveChannel = (updated: NanopayChannel | null) => {
    setChannel(updated);
    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const openChannel = useCallback(
    async (amount: string, address: string, executeTransferFn?: (to: string, amount: string) => Promise<any>) => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Register channel in backend
        const res = await fetch("/api/nanopay/channel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            initialDeposit: amount,
            clientAddress: address || "0x0000000000000000000000000000000000000000",
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to register channel with Gateway");
        }

        const data = await res.json();

        // 2. Fund channel with transaction
        if (!executeTransferFn) {
          throw new Error("Funding wallet function is not active. Please connect your wallet to fund the payment channel.");
        }
        // Send on-chain USDC to Circle Gateway deposit address
        await executeTransferFn(data.depositAddress, amount);

        // 3. Save active channel state
        const newChannel: NanopayChannel = {
          channelId: data.channelId,
          depositAmount: parseFloat(amount),
          balance: parseFloat(amount),
          cumulativeSpent: 0,
          clientPrivateKey: data.clientPrivateKey,
          clientPublicKey: data.clientPublicKey,
          isOpen: true,
        };

        saveChannel(newChannel);
        return newChannel;
      } catch (err: any) {
        console.error("Open nanopay channel failed:", err);
        setError(err.message || "Failed to open channel");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signPaymentToken = useCallback(
    async (chargeAmount: number): Promise<string | null> => {
      if (!channel || !channel.isOpen) return null;

      const newCumulative = channel.cumulativeSpent + chargeAmount;
      const newBalance = Math.max(0, channel.depositAmount - newCumulative);

      const updatedChannel = {
        ...channel,
        cumulativeSpent: newCumulative,
        balance: newBalance,
      };

      saveChannel(updatedChannel);

      // Generate the base64-encoded x402-payment-token containing signed channel state updates
      const nonce = Date.now();
      const message = `${channel.channelId}:${newCumulative.toFixed(6)}:${nonce}`;

      try {
        const account = privateKeyToAccount(channel.clientPrivateKey as `0x${string}`);
        const signature = await account.signMessage({ message });

        const payload = {
          channelId: channel.channelId,
          cumulativeAmount: newCumulative.toFixed(6),
          nonce,
          signature,
        };

        return btoa(JSON.stringify(payload));
      } catch (err) {
        console.error("Failed to sign payment token:", err);
        return null;
      }
    },
    [channel]
  );

  const closeChannel = useCallback(
    async (address: string) => {
      if (!channel) return null;
      setIsLoading(true);
      setError(null);
      try {
        const nonce = Date.now();
        const account = privateKeyToAccount(channel.clientPrivateKey as `0x${string}`);
        const message = `close:${channel.channelId}:${channel.cumulativeSpent.toFixed(6)}:${nonce}`;
        const signature = await account.signMessage({ message });

        const res = await fetch("/api/nanopay/channel", {
          method: "POST", // Use POST for routing action or route properly
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "close",
            channelId: channel.channelId,
            finalCumulativeAmount: channel.cumulativeSpent.toFixed(6),
            signature,
            nonce,
            recipientAddress: address,
          }),
        });

        // Try PUT as fallback since PUT was defined originally, let's keep fetch via PUT method
        const putRes = await fetch("/api/nanopay/channel", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "close",
            channelId: channel.channelId,
            finalCumulativeAmount: channel.cumulativeSpent.toFixed(6),
            signature,
            nonce,
            recipientAddress: address,
          }),
        });

        if (!putRes.ok) {
          throw new Error("Failed to settle channel with Gateway");
        }

        const data = await putRes.json();
        saveChannel(null); // Clear active channel state locally
        return data;
      } catch (err: any) {
        console.error("Close nanopay channel failed:", err);
        setError(err.message || "Failed to settle channel");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [channel]
  );

  return {
    channel,
    isLoading,
    error,
    openChannel,
    signPaymentToken,
    closeChannel,
  };
}
