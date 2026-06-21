"use client";

import { useState, useEffect, useRef } from "react";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

export interface CircleWalletState {
  userEmail: string | null;
  userToken: string | null;
  encryptionKey: string | null;
  walletId: string | null;
  walletAddress: string | null;
  isNewUser: boolean;
}

export function useCircleWallet() {
  const [state, setState] = useState<CircleWalletState>({
    userEmail: null,
    userToken: null,
    encryptionKey: null,
    walletId: null,
    walletAddress: null,
    isNewUser: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [challengeActive, setChallengeActive] = useState(false);


  const sdkRef = useRef<W3SSdk | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("wirestable_circle_wallet");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch (e) {
        console.error("Failed to parse saved Circle wallet session:", e);
      }
    }
  }, []);

  // Fetch balances whenever walletId/userToken are set
  const fetchBalance = async (walletId: string, userToken: string) => {
    try {
      const res = await fetch(`/api/circle-wallet/balances?walletId=${encodeURIComponent(walletId)}&userToken=${encodeURIComponent(userToken)}`);
      const data = await res.json();
      if (res.ok && data.balances && data.balances.length > 0) {
        const usdcBal = data.balances.find((b: any) => b.token.symbol === "USDC") || data.balances[0];
        setBalance(usdcBal.amount);
        setTokenId(usdcBal.token.id);
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  useEffect(() => {
    if (state.walletId && state.userToken) {
      fetchBalance(state.walletId, state.userToken);
    } else {
      setBalance(null);
      setTokenId(null);
    }
  }, [state.walletId, state.userToken]);

  // Save to local storage on change
  const saveState = (newState: CircleWalletState) => {
    setState(newState);
    localStorage.setItem("wirestable_circle_wallet", JSON.stringify(newState));
  };

  // Initialize Circle SDK client-side
  useEffect(() => {
    if (typeof window !== "undefined" && !sdkRef.current) {
      const appId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID;
      if (!appId) {
        console.error("[Circle UCW Hook] Critical Configuration Error: NEXT_PUBLIC_CIRCLE_APP_ID is not configured.");
      }
      
      sdkRef.current = new W3SSdk({
        appSettings: { appId: appId || "" }
      });

      const clientUrl = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL;
      if (clientUrl) {
        (sdkRef.current as any).serviceUrl = clientUrl;
        console.log("[Circle UCW Hook] Web SDK serviceUrl overridden to:", clientUrl);
      }

      // Apply a modern dark theme for seamless integration
      sdkRef.current.setThemeColor({
        bg: "#0f172a", // slate 900
        textMain: "#f8fafc", // slate 50
        textMain2: "#cbd5e1", // slate 300
        textAuxiliary: "#64748b", // slate 500
        mainBtnBg: "#3b82f6", // vibrant blue
        mainBtnText: "#ffffff",
        mainBtnBgOnHover: "#2563eb",
        inputBg: "#1e293b", // slate 800
        inputText: "#ffffff",
        inputBorderFocused: "#3b82f6",
        pinDotBase: "#475569", // slate 600
        pinDotActivated: "#3b82f6",
        divider: "#334155", // slate 700
        backdrop: "#020617", // slate 950
        backdropOpacity: 0.85,
      });

      console.log("[Circle UCW Hook] Web SDK initialized with App ID:", appId);
    }
  }, []);

  // Set auth settings on SDK when state changes
  useEffect(() => {
    if (sdkRef.current && state.userToken && state.encryptionKey) {
      sdkRef.current.setAuthentication({
        userToken: state.userToken,
        encryptionKey: state.encryptionKey,
      });
      console.log("[Circle UCW Hook] Authentication tokens synchronized with SDK.");
    }
  }, [state.userToken, state.encryptionKey]);

  // Query wallets for active user session
  const fetchWalletDetails = async (userToken: string, userId: string) => {
    try {
      const res = await fetch(`/api/circle-wallet/wallets?userToken=${encodeURIComponent(userToken)}&userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      
      if (!res.ok || !data.wallets || data.wallets.length === 0) {
        throw new Error(data.error || "No active wallets found for user.");
      }

      // We focus on ARC-TESTNET wallet
      const arcWallet = data.wallets.find((w: any) => w.blockchain === "ARC-TESTNET") || data.wallets[0];

      return {
        walletId: arcWallet.id,
        walletAddress: arcWallet.address,
      };
    } catch (err: any) {
      console.error("[Circle UCW Hook] Failed to fetch wallets:", err);
      throw err;
    }
  };

  // Onboard / register a user
  const registerUser = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/circle-wallet/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register user.");
      }

      const { userToken, encryptionKey, challengeId, isNewUser, userId } = data;

      const partialState: CircleWalletState = {
        userEmail: email,
        userToken,
        encryptionKey,
        walletId: data.walletId || null,
        walletAddress: data.address || null,
        isNewUser: !!isNewUser,
      };



      // If they are an existing user, just fetch their wallets
      if (!isNewUser) {
        const details = await fetchWalletDetails(userToken, userId);
        saveState({
          ...partialState,
          walletId: details.walletId,
          walletAddress: details.walletAddress,
        });
        setIsLoading(false);
        return true;
      }

      // New User: Execute setting up PIN challenge
      if (!sdkRef.current) {
        throw new Error("Circle SDK not initialized.");
      }

      setChallengeActive(true);
      setIsLoading(false);

      return new Promise<boolean>((resolve) => {
        sdkRef.current!.execute(challengeId, async (err, result) => {
          setChallengeActive(false);
          if (err) {
            console.error("[Circle UCW Hook] Initialization challenge failed:", err);
            setError(err.message || "Failed to complete security setup.");
            resolve(false);
          } else {
            console.log("[Circle UCW Hook] Initialization challenge complete:", result);
            try {
              setIsLoading(true);
              const details = await fetchWalletDetails(userToken, userId);
              saveState({
                ...partialState,
                walletId: details.walletId,
                walletAddress: details.walletAddress,
              });
              resolve(true);
            } catch (fetchErr: any) {
              setError(fetchErr.message || "Failed to sync wallet details.");
              resolve(false);
            } finally {
              setIsLoading(false);
            }
          }
        });
      });

    } catch (err: any) {
      setError(err.message || "Onboarding failed.");
      setIsLoading(false);
      return false;
    }
  };

  // Perform a transaction transfer
  const executeTransfer = async (destinationAddress: string, amount: string, tokenId: string): Promise<string | null> => {
    if (!state.userToken || !state.walletId) {
      setError("User session is not active or wallet is missing.");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/circle-wallet/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userToken: state.userToken,
          walletId: state.walletId,
          destinationAddress,
          amount,
          tokenId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create transfer challenge.");
      }

      const { challengeId, id: txId } = data;



      if (!sdkRef.current) {
        throw new Error("Circle SDK not initialized.");
      }

      setChallengeActive(true);
      setIsLoading(false);

      return new Promise<string | null>((resolve) => {
        sdkRef.current!.execute(challengeId, async (err, result) => {
          setChallengeActive(false);
          if (err) {
            console.error("[Circle UCW Hook] Transfer challenge failed:", err);
            setError(err.message || "Failed to sign transfer.");
            resolve(null);
          } else {
            console.log("[Circle UCW Hook] Transfer challenge complete:", result);
            // Poll for the actual on-chain transaction hash
            try {
              let txHash = "";
              let retries = 20;
              while (retries > 0 && !txHash) {
                await new Promise((r) => setTimeout(r, 2000));
                const statusRes = await fetch(`/api/circle-wallet/transaction?id=${txId}`);
                if (statusRes.ok) {
                  const statusData = await statusRes.json();
                  if (statusData.txHash) {
                    txHash = statusData.txHash;
                    break;
                  }
                }
                retries--;
              }
              resolve(txHash || null);
            } catch (pollErr) {
              console.error("Failed polling user transaction hash:", pollErr);
              resolve(null);
            }
          }
        });
      });

    } catch (err: any) {
      setError(err.message || "Transaction signature failed.");
      setIsLoading(false);
      return null;
    }
  };

  // Disconnect / Clear session
  const disconnect = () => {
    setState({
      userEmail: null,
      userToken: null,
      encryptionKey: null,
      walletId: null,
      walletAddress: null,
      isNewUser: false,
    });
    localStorage.removeItem("wirestable_circle_wallet");
    setError(null);
  };

  return {
    ...state,
    isLoading,
    balance,
    tokenId,
    error,
    challengeActive,

    registerUser,
    executeTransfer,
    disconnect,
    refreshBalance: () => {
      if (state.walletId && state.userToken) {
        fetchBalance(state.walletId, state.userToken);
      }
    }
  };
}
