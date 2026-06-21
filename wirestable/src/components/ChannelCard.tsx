"use client";

import React, { useState } from "react";
import { NanopayChannel } from "@/hooks/useNanopayments";

interface ChannelCardProps {
  channel: NanopayChannel | null;
  onOpen: (amount: string, isSandbox?: boolean) => Promise<any>;
  onClose: () => Promise<any>;
  isProcessing: boolean;
  walletAddress?: string;
  walletBalance?: string | null;
}

export function ChannelCard({
  channel,
  onOpen,
  onClose,
  isProcessing,
  walletAddress,
  walletBalance,
}: ChannelCardProps) {
  const [depositAmount, setDepositAmount] = useState("2.00");
  const [cardError, setCardError] = useState<string | null>(null);

  const handleOpenClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setCardError("Please enter a valid deposit amount greater than 0.");
      return;
    }

    if (walletBalance && parseFloat(walletBalance) < amount) {
      setCardError(`Insufficient balance. You have ${walletBalance} USDC.`);
      return;
    }

    const result = await onOpen(depositAmount);
    if (!result) {
      setCardError("Failed to open channel. Verify transaction status.");
    }
  };

  const handleOpenSandboxClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setCardError(null);
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setCardError("Please enter a valid deposit amount greater than 0.");
      return;
    }

    const result = await onOpen(depositAmount, true);
    if (!result) {
      setCardError("Failed to open Sandbox channel.");
    }
  };

  const handleCloseClick = async () => {
    setCardError(null);
    const result = await onClose();
    if (!result) {
      setCardError("Failed to close and settle channel.");
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: "var(--space-5)",
        background: channel ? "rgba(16, 185, 129, 0.03)" : "rgba(255, 255, 255, 0.02)",
        border: channel
          ? "1px solid rgba(16, 185, 129, 0.2)"
          : "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        position: "relative",
        overflow: "hidden",
        boxShadow: channel ? "0 4px 20px rgba(16, 185, 129, 0.05)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      {/* Glow highlight */}
      {channel && (
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}

      {channel ? (
        // ACTIVE CHANNEL LAYOUT
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
            <div>
              <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                    display: "inline-block",
                    boxShadow: "0 0 8px #10b981",
                  }}
                  className="animate-pulse"
                />
                Gateway Nanopay Channel
              </span>
              <div style={{ fontSize: "0.6875rem", fontFamily: "monospace", color: "var(--color-text-tertiary)", marginTop: "6px" }}>
                ID: {channel.channelId}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>Charge/Query</span>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-secondary)" }}>
                $0.0005 USDC
              </div>
            </div>
          </div>

          {/* Balance display */}
          <div style={{ textAlign: "center", padding: "var(--space-4) 0", background: "rgba(0,0,0,0.15)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-4)" }}>
            <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Off-Chain Channel Balance
            </span>
            <div
              className="text-mono"
              style={{
                fontSize: "1.85rem",
                fontWeight: 800,
                color: "#10b981",
                margin: "4px 0",
                letterSpacing: "-0.01em",
              }}
            >
              {channel.balance.toFixed(6)}{" "}
              <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--color-text-secondary)" }}>USDC</span>
            </div>
          </div>

          {/* Ledger stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Initial Deposit:</span>
              <span className="text-mono">{channel.depositAmount.toFixed(2)} USDC</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Cumulative Paid:</span>
              <span className="text-mono" style={{ color: "var(--color-warning)" }}>
                {channel.cumulativeSpent.toFixed(6)} USDC
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Network Protocol:</span>
              <span className="font-semibold text-blue-400">Circle x402 Micropay</span>
            </div>
          </div>

          {cardError && (
            <div className="alert alert-danger" style={{ marginBottom: "var(--space-4)", fontSize: "0.75rem" }}>
              {cardError}
            </div>
          )}

          <button
            className="btn btn-secondary"
            onClick={handleCloseClick}
            disabled={isProcessing}
            style={{
              width: "100%",
              borderColor: "rgba(239, 68, 68, 0.4)",
              color: "#ef4444",
              background: "transparent",
            }}
            type="button"
          >
            {isProcessing ? "Settling Gateway Channel..." : "🛑 Close Channel & Settle Balance"}
          </button>
        </div>
      ) : (
        // NO CHANNEL - REGISTRATION LAYOUT
        <div>
          <h4 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "var(--space-2)", color: "var(--color-text-primary)" }}>
            ⚡ Enable Gateway Nanopayments
          </h4>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)", lineHeight: "1.4" }}>
            Open a high-frequency nanopay channel sponsored by Circle. Chat inquiries are billed at a rate of <strong>$0.0005 USDC</strong> per request, avoiding browser signer prompt delays.
          </p>

          <form onSubmit={handleOpenClick} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div>
              <label style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>
                Channel Deposit Funding (USDC)
              </label>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="form-control"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  style={{ flex: 1 }}
                  placeholder="2.00"
                  disabled={isProcessing}
                />
                <span style={{ display: "flex", alignItems: "center", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                  USDC
                </span>
              </div>
            </div>

            {cardError && (
              <div className="alert alert-danger" style={{ fontSize: "0.75rem", padding: "8px" }}>
                {cardError}
              </div>
            )}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={isProcessing || !walletAddress}
              style={{ width: "100%" }}
            >
              {isProcessing ? "Funding Off-Chain Channel..." : "🔑 Open & Fund Channel"}
            </button>
          </form>

          {!walletAddress && (
            <div style={{ marginTop: "var(--space-3)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                className="btn btn-secondary"
                onClick={handleOpenSandboxClick}
                disabled={isProcessing}
                style={{ width: "100%", background: "rgba(59, 130, 246, 0.12)", color: "#60a5fa", borderColor: "rgba(59, 130, 246, 0.25)", fontWeight: 700 }}
                type="button"
              >
                {isProcessing ? "Opening Sandbox Channel..." : "🧪 Open Sandbox Demo Channel"}
              </button>
              <div style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", textAlign: "center" }}>
                Connect wallet above to fund a real payment channel.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
