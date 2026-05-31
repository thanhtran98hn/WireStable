"use client";

import type { ChatMessage } from "@/types";

interface ConfirmationCardProps {
  message: ChatMessage;
  onConfirm: () => void;
  onCancel: () => void;
  isSending: boolean;
}

export function ConfirmationCard({
  message,
  onConfirm,
  onCancel,
  isSending,
}: ConfirmationCardProps) {
  const { intent, swapIntent, gasEstimate } = message;

  if (!intent && !swapIntent) return null;
  
  const isSwap = !!swapIntent;

  return (
    <div className="chat-bubble chat-bubble-ai" style={{ maxWidth: "460px" }}>
      {/* AI message */}
      {message.content && (
        <p style={{ marginBottom: "var(--space-4)", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          {message.content}
        </p>
      )}

      {/* Confirmation Card */}
      <div className="confirm-card">
        {/* Header */}
        <div className="confirm-card-header">
          <div className="confirm-card-icon">{isSwap ? "💱" : "💸"}</div>
          <div>
            <div className="confirm-card-title">
              {isSwap ? `Confirm Swap to ${swapIntent?.tokenOut}` : `Confirm ${intent?.token || "USDC"} Transfer`}
            </div>
            <div className="confirm-card-subtitle">
              Review the details below before confirming
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="confirm-card-row">
          <span className="confirm-card-label">{isSwap ? "Swap Amount" : "Amount"}</span>
          <span className="confirm-card-value amount">
            {isSwap ? `${swapIntent?.amountIn} ${swapIntent?.tokenIn}` : `${intent?.amount} ${intent?.token || "USDC"}`}
          </span>
        </div>

        {/* Swap Receive / Transfer To */}
        {isSwap ? (
          <div className="confirm-card-row">
            <span className="confirm-card-label">Receive (Est.)</span>
            <span className="confirm-card-value amount" style={{ color: "var(--color-primary)" }}>
              {/* For mock purposes, assuming 1:1 or showing unknown */}
              ~{swapIntent?.amountIn} {swapIntent?.tokenOut}
            </span>
          </div>
        ) : (
          <div className="confirm-card-row">
            <span className="confirm-card-label">To</span>
            <div style={{ textAlign: "right" }}>
              {intent?.recipientName && (
                <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "2px" }}>
                  {intent.recipientName}
                </div>
              )}
              <span className="confirm-card-address" title={intent?.to}>
                {intent?.to}
              </span>
            </div>
          </div>
        )}

        {/* Network */}
        <div className="confirm-card-row">
          <span className="confirm-card-label">Network</span>
          <span className="confirm-card-value">
            <span className="network-badge">
              <span className="network-dot" />
              Arc Testnet
            </span>
          </span>
        </div>

        {/* Gas Fee */}
        <div className="confirm-card-row">
          <span className="confirm-card-label">Est. Gas Fee</span>
          <span className="confirm-card-value" style={{ fontSize: "0.8125rem" }}>
            {gasEstimate?.fee || "~0.001"} USDC
          </span>
        </div>

        {/* Total (Only for transfers, omit for swaps since it's just a gas fee) */}
        {!isSwap && (
          <div
            className="confirm-card-row"
            style={{
              borderTop: "2px solid var(--color-border)",
              borderBottom: "none",
              paddingTop: "var(--space-4)",
              marginTop: "var(--space-2)",
            }}
          >
            <span className="confirm-card-label" style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
              Total
            </span>
            <span className="confirm-card-value" style={{ fontSize: "1.125rem" }}>
              {(
                parseFloat(intent?.amount || "0") +
                parseFloat(gasEstimate?.fee || "0.001")
              ).toFixed(6)}{" "}
              {intent?.token || "USDC"}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="confirm-card-actions">
          <button
            className="btn btn-secondary btn-lg"
            onClick={onCancel}
            disabled={isSending}
            id="cancel-transfer-btn"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={onConfirm}
            disabled={isSending}
            id="confirm-transfer-btn"
            style={{ flex: 2 }}
          >
            {isSending ? (
              <>
                <span className="spinner" />
                {isSwap ? "Swapping..." : "Sending..."}
              </>
            ) : (
              isSwap ? "🔄 Confirm Swap" : "✅ Confirm & Sign"
            )}
          </button>
        </div>

        {/* Security note */}
        <p
          style={{
            fontSize: "0.6875rem",
            color: "var(--color-text-tertiary)",
            textAlign: "center",
            marginTop: "var(--space-3)",
            lineHeight: 1.4,
          }}
        >
          🔒 Your wallet will prompt you to sign this transaction.
          <br />
          Funds will be sent on Arc Testnet only.
        </p>
      </div>
    </div>
  );
}
