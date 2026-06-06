"use client";

import type { ChatMessage } from "@/types";

interface TxTrackerProps {
  message: ChatMessage;
}

export function TxTracker({ message }: TxTrackerProps) {
  const { txHash, txStatus, explorerUrl } = message;

  const progressWidth =
    txStatus === "confirmed"
      ? 100
      : txStatus === "failed"
      ? 100
      : 60;

  const statusColor =
    txStatus === "confirmed"
      ? "var(--color-success)"
      : txStatus === "failed"
      ? "var(--color-error)"
      : "var(--color-warning)";

  return (
    <div className="chat-bubble chat-bubble-ai" style={{ maxWidth: "460px" }}>
      <div className="tx-tracker">
        {/* Header */}
        <div className="tx-tracker-header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span style={{ fontSize: "1.125rem" }}>
              {txStatus === "confirmed"
                ? "✅"
                : txStatus === "failed"
                ? "❌"
                : "⏳"}
            </span>
            <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
              {message.swapIntent
                ? txStatus === "confirmed"
                  ? "Swap Confirmed"
                  : txStatus === "failed"
                  ? "Swap Failed"
                  : "Processing Swap..."
                : txStatus === "confirmed"
                ? "Transfer Confirmed"
                : txStatus === "failed"
                ? "Transfer Failed"
                : "Processing..."}
            </span>
          </div>
          <span
            className={`status-badge ${
              txStatus === "confirmed"
                ? "status-badge-success"
                : txStatus === "failed"
                ? "status-badge-error"
                : "status-badge-pending"
            }`}
          >
            {txStatus === "confirmed"
              ? "Success"
              : txStatus === "failed"
              ? "Failed"
              : "Pending"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="tx-tracker-progress">
          <div
            className="tx-tracker-progress-bar"
            style={{
              width: `${progressWidth}%`,
              background:
                txStatus === "failed"
                  ? "var(--color-error)"
                  : txStatus === "confirmed"
                  ? "var(--color-success)"
                  : `linear-gradient(90deg, var(--color-accent), ${statusColor})`,
            }}
          />
        </div>

        {/* Message */}
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-text-secondary)",
            marginTop: "var(--space-3)",
            lineHeight: 1.5,
          }}
        >
          {message.content}
        </p>

        {/* Tx Hash + Explorer Link */}
        {txHash && (
          <div
            style={{
              marginTop: "var(--space-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--space-2) var(--space-3)",
              background: "var(--color-bg-secondary)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <span
              className="text-mono"
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-tertiary)",
              }}
            >
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </span>
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-link"
                id="view-on-arcscan-link"
              >
                View on Arcscan →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
