"use client";

import React, { useState } from "react";

interface HedgingLockCardProps {
  amount: number;
  spotRate: number;
  targetRate: number;
  premium: number;
  expiration: string;
  onApprove: (lockId: number) => void;
  onCancel: () => void;
}

export function HedgingLockCard({
  amount,
  spotRate,
  targetRate,
  premium,
  expiration,
  onApprove,
  onCancel,
}: HedgingLockCardProps) {
  const [status, setStatus] = useState<"pending" | "approved" | "settled">("pending");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lockId, setLockId] = useState<number | null>(null);

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const randomLockId = Math.floor(Math.random() * 90000) + 10000;
      setLockId(randomLockId);
      setStatus("approved");
      setIsProcessing(false);
      onApprove(randomLockId);
    }, 1200);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div
      className="card"
      style={{
        padding: "20px",
        background: "var(--color-surface-glass)",
        border: "1px solid var(--color-border)",
        borderRadius: "16px",
        maxWidth: "480px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "1.125rem" }}>🛡️</span>
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: "0.9375rem" }}>FX Hedging Rate Lock</h4>
          </div>
          <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
            USDC-EURC Remittance Corridor (24-Hour Lock)
          </span>
        </div>

        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "4px",
            background:
              status === "approved"
                ? "rgba(16, 185, 129, 0.1)"
                : status === "settled"
                ? "rgba(59, 130, 246, 0.1)"
                : "rgba(245, 158, 11, 0.1)",
            color:
              status === "approved"
                ? "var(--color-success)"
                : status === "settled"
                ? "var(--color-accent)"
                : "var(--color-warning)",
            textTransform: "uppercase",
          }}
        >
          {status}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "rgba(255,255,255,0.01)", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border-light)" }}>
        <div>
          <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", display: "block" }}>
            Lock Amount
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{amount.toLocaleString()} USDC</span>
        </div>

        <div>
          <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", display: "block" }}>
            Option Premium
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-accent)" }}>
            {premium.toFixed(4)} USDC
          </span>
        </div>

        <div>
          <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", display: "block" }}>
            Target Locked Rate
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>1 USDC = {targetRate} EURC</span>
        </div>

        <div>
          <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", display: "block" }}>
            Expirations
          </span>
          <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>
            {new Date(expiration).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (24h)
          </span>
        </div>
      </div>

      {status === "pending" ? (
        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
          <button
            onClick={handleCancel}
            className="btn btn-secondary"
            style={{ flex: 1, padding: "8px" }}
            disabled={isProcessing}
          >
            Decline
          </button>
          <button
            onClick={handleApprove}
            className="btn btn-primary"
            style={{ flex: 2, padding: "8px" }}
            disabled={isProcessing}
          >
            {isProcessing ? "Purchasing..." : "Approve & Buy Lock"}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
            Option rate lock purchased on Arc Testnet. Lock ID:{" "}
            <span className="text-mono" style={{ color: "var(--color-accent)", fontWeight: "bold" }}>
              #{lockId}
            </span>
          </div>
          <div style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
            Use commands like `/swap` or send transfers to settle using the locked rate.
          </div>
        </div>
      )}
    </div>
  );
}
