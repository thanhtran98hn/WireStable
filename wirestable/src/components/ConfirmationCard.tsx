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
  const { intent, swapIntent, bridgeIntent, gasEstimate } = message;

  if (!intent && !swapIntent && !bridgeIntent) return null;
  
  const isSwap = !!swapIntent;
  const isBridge = !!bridgeIntent;

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
          <div className="confirm-card-icon">{isSwap ? "💱" : isBridge ? "🌉" : "💸"}</div>
          <div>
            <div className="confirm-card-title">
              {isSwap ? `Confirm Swap to ${swapIntent?.tokenOut}` : isBridge ? "Confirm CCTP Bridge" : `Confirm ${intent?.token || "USDC"} Transfer`}
            </div>
            <div className="confirm-card-subtitle">
              Review the details below before confirming
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="confirm-card-row">
          <span className="confirm-card-label">{isSwap ? "Swap Amount" : isBridge ? "Bridge Amount" : "Amount"}</span>
          <span className="confirm-card-value amount">
            {isSwap ? `${swapIntent?.amountIn} ${swapIntent?.tokenIn}` : isBridge ? `${bridgeIntent?.amount} USDC` : `${intent?.amount} ${intent?.token || "USDC"}`}
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
        ) : isBridge ? (
          <div className="confirm-card-row">
            <span className="confirm-card-label">To (Arc Recipient)</span>
            <div style={{ textAlign: "right" }}>
              <span className="confirm-card-address" title={bridgeIntent?.to}>
                {bridgeIntent?.to}
              </span>
            </div>
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

        {/* Network / Bridge Route */}
        {isBridge ? (
          <>
            <div className="confirm-card-row">
              <span className="confirm-card-label">Source Network</span>
              <span className="confirm-card-value" style={{ fontWeight: 600, color: "#94a3b8" }}>
                {bridgeIntent?.sourceChain} (Sandbox)
              </span>
            </div>
            <div className="confirm-card-row">
              <span className="confirm-card-label">Destination Network</span>
              <span className="confirm-card-value" style={{ fontWeight: 600, color: "#34d399" }}>
                Arc Testnet
              </span>
            </div>
          </>
        ) : (
          <div className="confirm-card-row">
            <span className="confirm-card-label">Network</span>
            <span className="confirm-card-value">
              <span className="network-badge">
                <span className="network-dot" />
                Arc Testnet
              </span>
            </span>
          </div>
        )}

        {/* Gas Fee */}
        {!isBridge && (
          <div className="confirm-card-row">
            <span className="confirm-card-label">Est. Gas Fee</span>
            <span className="confirm-card-value" style={{ fontSize: "0.8125rem" }}>
              {gasEstimate?.fee || "~0.001"} USDC
            </span>
          </div>
        )}

        {/* Total (Only for transfers, omit for swaps & bridges since they have custom paths) */}
        {!isSwap && !isBridge && (
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
                {isSwap ? "Swapping..." : isBridge ? "Bridging..." : "Sending..."}
              </>
            ) : (
              isSwap ? "🔄 Confirm Swap" : isBridge ? "🌉 Confirm Bridge" : "✅ Confirm & Sign"
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
          🔒 Your wallet will prompt you to sign.
          <br />
          {isBridge ? `Bridging utilizes Circle CCTP burn-and-mint mechanism.` : `Funds will be sent on Arc Testnet only.`}
        </p>
      </div>
    </div>
  );
}
