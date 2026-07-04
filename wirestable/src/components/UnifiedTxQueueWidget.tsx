"use client";

import React, { useState, useEffect } from "react";
import { useTxRegistry, TransactionItem } from "@/context/TxRegistryContext";
import { BoltIcon, BriefcaseIcon, WarningIcon } from "@/components/icons/CustomIcons";

export function UnifiedTxQueueWidget() {
  const { transactions, removeTransaction, clearAll } = useTxRegistry();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewAlert, setHasNewAlert] = useState(false);

  const activeTxs = transactions.filter((tx) => tx.status === "pending");
  const completedTxs = transactions.filter((tx) => tx.status !== "pending");

  // Pulse effect when a new transaction is added or finishes
  useEffect(() => {
    if (activeTxs.length > 0) {
      setHasNewAlert(true);
      const timer = setTimeout(() => setHasNewAlert(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [activeTxs.length]);

  // Hide widget completely if there are no transactions
  if (transactions.length === 0) return null;

  const handleToggle = () => setIsOpen(!isOpen);

  // Helper to format step messages cleanly
  const formatStep = (step?: string) => {
    if (!step) return "Processing...";
    return step
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 900,
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "10px",
        pointerEvents: "none", // Prevent overlay blocking when collapsed
      }}
    >
      {/* Expanded Transaction Panel */}
      {isOpen && (
        <div
          className="card"
          style={{
            width: "340px",
            maxHeight: "420px",
            background: "rgba(16, 20, 38, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 107, 74, 0.2)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg), 0 8px 32px rgba(0, 0, 0, 0.4)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            pointerEvents: "auto",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BoltIcon size={16} animate />
              <strong style={{ fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
                Transaction Queue ({activeTxs.length})
              </strong>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {completedTxs.length > 0 && (
                <button
                  onClick={clearAll}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-text-tertiary)",
                    fontSize: "0.6875rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Clear History
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-secondary)",
                  fontSize: "1rem",
                  cursor: "pointer",
                  padding: "0 4px",
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Transaction Items list */}
          <div
            style={{
              overflowY: "auto",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              flex: 1,
            }}
          >
            {transactions.map((tx) => (
              <div
                key={tx.id}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: `1px solid ${
                    tx.status === "pending"
                      ? "rgba(255, 107, 74, 0.1)"
                      : tx.status === "success"
                      ? "rgba(52, 211, 153, 0.15)"
                      : "rgba(239, 68, 68, 0.15)"
                  }`,
                  borderRadius: "8px",
                  padding: "10px 12px",
                  position: "relative",
                }}
              >
                {/* Remove item button for completed transactions */}
                {tx.status !== "pending" && (
                  <button
                    onClick={() => removeTransaction(tx.id)}
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      background: "transparent",
                      border: "none",
                      color: "var(--color-text-tertiary)",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                    }}
                  >
                    ×
                  </button>
                )}

                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  {/* Status Indicator Icon */}
                  <div style={{ marginTop: "2px" }}>
                    {tx.status === "pending" ? (
                      <span className="spinner-mini" style={{ display: "block" }} />
                    ) : tx.status === "success" ? (
                      <span style={{ color: "#34d399", fontSize: "0.875rem" }}>✓</span>
                    ) : (
                      <WarningIcon size={14} className="text-red-500" />
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        lineHeight: 1.3,
                        wordBreak: "break-word",
                      }}
                    >
                      {tx.description}
                    </div>

                    {tx.status === "pending" && (
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--color-accent)",
                          fontWeight: 500,
                          marginTop: "4px",
                        }}
                      >
                        Status: {formatStep(tx.step)}
                      </div>
                    )}

                    {tx.error && (
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          color: "#ef4444",
                          marginTop: "4px",
                          wordBreak: "break-word",
                        }}
                      >
                        {tx.error}
                      </div>
                    )}

                    {tx.txHash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--color-text-tertiary)",
                          textDecoration: "underline",
                          marginTop: "6px",
                          display: "inline-block",
                        }}
                      >
                        View on Explorer ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={handleToggle}
        className={`hover-lift active-press`}
        style={{
          pointerEvents: "auto",
          background: hasNewAlert
            ? "var(--color-primary)"
            : activeTxs.length > 0
            ? "var(--color-primary)"
            : "rgba(16, 20, 38, 0.9)",
          color: "#fff",
          border: `1px solid ${
            activeTxs.length > 0 ? "var(--color-primary)" : "var(--color-border)"
          }`,
          borderRadius: "999px",
          padding: "10px 18px",
          fontSize: "0.8125rem",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: hasNewAlert ? "scale(1.05)" : "none",
        }}
      >
        {activeTxs.length > 0 ? (
          <>
            <span className="spinner-mini" style={{ borderLeftColor: "#fff", width: "12px", height: "12px" }} />
            <span>{activeTxs.length} Transaction{activeTxs.length > 1 ? "s" : ""} Processing</span>
          </>
        ) : (
          <>
            <BriefcaseIcon size={16} />
            <span>Tx Queue ({transactions.length})</span>
          </>
        )}
      </button>
    </div>
  );
}
