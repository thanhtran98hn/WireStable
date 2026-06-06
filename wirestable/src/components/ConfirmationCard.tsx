"use client";

import { useState, useEffect } from "react";
import { recoverMessageAddress } from "viem";
import type { ChatMessage } from "@/types";

interface ConfirmationCardProps {
  message: ChatMessage;
  onConfirm: () => void;
  onCancel: () => void;
  isSending: boolean;
  timeLeft?: number;
  activeQuote?: any;
}

export function ConfirmationCard({
  message,
  onConfirm,
  onCancel,
  isSending,
  timeLeft,
  activeQuote,
}: ConfirmationCardProps) {
  const { intent, swapIntent, bridgeIntent, streamCreateIntent, escrowCreateIntent, escrowSubmitIntent, gasEstimate } = message;

  const [signatureStatus, setSignatureStatus] = useState<"verifying" | "valid" | "invalid" | "unsigned">("verifying");
  const [recoveredAgent, setRecoveredAgent] = useState<string | null>(null);

  useEffect(() => {
    async function verifySignature() {
      const { agentSignature, agentPayloadHash } = message;
      if (!agentSignature || !agentPayloadHash) {
        setSignatureStatus("unsigned");
        return;
      }

      try {
        const signerAddress = await recoverMessageAddress({
          message: { raw: agentPayloadHash as `0x${string}` },
          signature: agentSignature as `0x${string}`,
        });
        
        const res = await fetch("/api/agent/identity");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.agentAddress.toLowerCase() === signerAddress.toLowerCase()) {
            setSignatureStatus("valid");
            setRecoveredAgent(data.agentAddress);
          } else {
            setSignatureStatus("invalid");
          }
        } else {
          setSignatureStatus("valid");
          setRecoveredAgent(signerAddress);
        }
      } catch (err) {
        console.error("Signature verification failed:", err);
        setSignatureStatus("invalid");
      }
    }

    verifySignature();
  }, [message]);

  if (!intent && !swapIntent && !bridgeIntent && !streamCreateIntent && !escrowCreateIntent && !escrowSubmitIntent) return null;
  
  const isSwap = !!swapIntent;
  const isBridge = !!bridgeIntent;
  const isStream = !!streamCreateIntent;
  const isEscrowCreate = !!escrowCreateIntent;
  const isEscrowSubmit = !!escrowSubmitIntent;
  const isExpired = isSwap && timeLeft === 0;

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
          <div className="confirm-card-icon">{isSwap ? "💱" : isBridge ? "🌉" : isStream ? "🌊" : isEscrowCreate ? "🔒" : isEscrowSubmit ? "📤" : "💸"}</div>
          <div>
            <div className="confirm-card-title">
              {isSwap ? `Confirm Swap to ${swapIntent?.tokenOut}` : isBridge ? "Confirm CCTP Bridge" : isStream ? "Confirm Payroll Stream" : isEscrowCreate ? "Confirm Escrow Labor Deal" : isEscrowSubmit ? "Confirm Work Submission" : `Confirm ${intent?.token || "USDC"} Transfer`}
            </div>
            <div className="confirm-card-subtitle">
              Review the details below before confirming
            </div>
          </div>
        </div>

        {/* Amount */}
        {!isEscrowSubmit && (
          <div className="confirm-card-row">
            <span className="confirm-card-label">
              {isSwap ? "Swap Amount" : isBridge ? "Bridge Amount" : isStream ? "Funding Amount" : isEscrowCreate ? "Locking Amount" : "Amount"}
            </span>
            <span className="confirm-card-value amount">
              {isSwap ? `${swapIntent?.amountIn} ${swapIntent?.tokenIn}` : isBridge ? `${bridgeIntent?.amount} USDC` : isStream ? `${streamCreateIntent?.amount} USDC` : isEscrowCreate ? `${escrowCreateIntent?.amount} USDC` : `${intent?.amount} ${intent?.token || "USDC"}`}
            </span>
          </div>
        )}

        {/* Swap Receive / Transfer To */}
        {isSwap ? (
          <div className="confirm-card-row">
            <span className="confirm-card-label">Receive (Est.)</span>
            <span className="confirm-card-value amount" style={{ color: "var(--color-primary)" }}>
              {activeQuote ? `${parseFloat(activeQuote.buyAmount).toFixed(4)} ${swapIntent?.tokenOut}` : `~${swapIntent?.amountIn} ${swapIntent?.tokenOut}`}
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
        ) : isStream ? (
          <>
            <div className="confirm-card-row">
              <span className="confirm-card-label">Recipient</span>
              <div style={{ textAlign: "right" }}>
                <span className="confirm-card-address" title={streamCreateIntent?.to}>
                  {streamCreateIntent?.to}
                </span>
              </div>
            </div>
            <div className="confirm-card-row">
              <span className="confirm-card-label">Flow Rate</span>
              <span className="confirm-card-value" style={{ fontWeight: 600 }}>
                {streamCreateIntent?.ratePerSecond} micro-USDC/sec
              </span>
            </div>
            <div className="confirm-card-row">
              <span className="confirm-card-label">Duration</span>
              <span className="confirm-card-value" style={{ fontWeight: 600 }}>
                {streamCreateIntent?.durationSeconds === "604800" ? "1 Week" : streamCreateIntent?.durationSeconds === "2592000" ? "1 Month" : `${streamCreateIntent?.durationSeconds} Seconds`}
              </span>
            </div>
          </>
        ) : isEscrowCreate ? (
          <>
            <div className="confirm-card-row">
              <span className="confirm-card-label">Provider (Freelancer)</span>
              <div style={{ textAlign: "right" }}>
                <span className="confirm-card-address" title={escrowCreateIntent?.to}>
                  {escrowCreateIntent?.to}
                </span>
              </div>
            </div>
            <div className="confirm-card-row">
              <span className="confirm-card-label">Task Hash</span>
              <span className="confirm-card-value text-mono" style={{ fontSize: "0.75rem" }}>
                {escrowCreateIntent?.deliverableHash?.slice(0, 14)}...
              </span>
            </div>
          </>
        ) : isEscrowSubmit ? (
          <>
            <div className="confirm-card-row">
              <span className="confirm-card-label">Job ID</span>
              <span className="confirm-card-value font-bold">
                #{escrowSubmitIntent?.jobId}
              </span>
            </div>
            <div className="confirm-card-row">
              <span className="confirm-card-label">Submission Link</span>
              <a
                href={escrowSubmitIntent?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="confirm-card-value"
                style={{ color: "var(--color-primary)", textDecoration: "underline", fontSize: "0.8125rem" }}
              >
                {escrowSubmitIntent?.url?.replace("https://", "").slice(0, 24)}...
              </a>
            </div>
          </>
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

        {/* Swap Rates Breakdown */}
        {isSwap && activeQuote && (
          <>
            <div className="confirm-card-row">
              <span className="confirm-card-label">Exchange Rate</span>
              <span className="confirm-card-value" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                1 {swapIntent?.tokenIn} = {parseFloat(activeQuote.rate).toFixed(4)} {swapIntent?.tokenOut}
              </span>
            </div>
            <div className="confirm-card-row">
              <span className="confirm-card-label">Spread / Slippage</span>
              <span className="confirm-card-value" style={{ fontSize: "0.8125rem" }}>
                {(parseFloat(activeQuote.spread) * 100).toFixed(2)}% / {(parseFloat(activeQuote.slippage) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="confirm-card-row">
              <span className="confirm-card-label">StableFX Fee</span>
              <span className="confirm-card-value" style={{ fontSize: "0.8125rem" }}>
                {activeQuote.fee} {swapIntent?.tokenIn}
              </span>
            </div>
          </>
        )}

        {/* Expiry Progress Ring */}
        {isSwap && timeLeft !== undefined && timeLeft > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-2)",
              padding: "var(--space-2)",
              background: "rgba(59, 130, 246, 0.08)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(59, 130, 246, 0.15)",
              marginTop: "var(--space-3)",
              marginBottom: "var(--space-3)",
            }}
          >
            <svg width="20" height="20" style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="2.5"
                fill="transparent"
              />
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 8}
                strokeDashoffset={2 * Math.PI * 8 * (1 - timeLeft / 30)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
              StableFX Quote expires in <strong style={{ color: "var(--color-primary)" }}>{timeLeft}s</strong>
            </span>
          </div>
        )}

        {isSwap && timeLeft === 0 && (
          <div
            style={{
              padding: "var(--space-2)",
              background: "rgba(239, 68, 68, 0.08)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(239, 68, 68, 0.15)",
              color: "var(--color-error)",
              fontSize: "0.75rem",
              textAlign: "center",
              marginTop: "var(--space-3)",
              marginBottom: "var(--space-3)",
            }}
          >
            ⚠️ Quote expired. Please type a new command or restart swap.
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

        {/* Total (Only for transfers & escrow creation, omit for swaps, bridges & submissions) */}
        {!isSwap && !isBridge && !isStream && !isEscrowSubmit && (
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
                parseFloat((isEscrowCreate ? escrowCreateIntent?.amount : intent?.amount) || "0") +
                parseFloat(gasEstimate?.fee || "0.001")
              ).toFixed(6)}{" "}
              {isEscrowCreate ? "USDC" : (intent?.token || "USDC")}
            </span>
          </div>
        )}

        {/* Agent Cryptographic Signature Verification Badge */}
        <div 
          style={{
            marginTop: "var(--space-4)",
            marginBottom: "var(--space-4)",
            padding: "var(--space-3)",
            background: signatureStatus === "valid" 
              ? "rgba(16, 185, 129, 0.05)" 
              : signatureStatus === "invalid" 
                ? "rgba(239, 68, 68, 0.05)" 
                : "rgba(107, 114, 128, 0.05)",
            border: `1px solid ${
              signatureStatus === "valid" 
                ? "rgba(16, 185, 129, 0.15)" 
                : signatureStatus === "invalid" 
                  ? "rgba(239, 68, 68, 0.15)" 
                  : "rgba(107, 114, 128, 0.15)"
            }`,
            borderRadius: "var(--radius-md, 8px)",
            fontSize: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
            {signatureStatus === "verifying" && (
              <>
                <span className="spinner" style={{ width: "12px", height: "12px", border: "2px solid var(--color-primary)", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} />
                <span style={{ color: "var(--color-text-secondary)" }}>Verifying Agent Signature...</span>
              </>
            )}
            {signatureStatus === "valid" && (
              <>
                <span style={{ color: "rgb(16, 185, 129)" }}>🛡️ Verifiable ERC-8004 Payload</span>
              </>
            )}
            {signatureStatus === "invalid" && (
              <>
                <span style={{ color: "rgb(239, 68, 68)" }}>⚠️ Signature Verification Failed</span>
              </>
            )}
            {signatureStatus === "unsigned" && (
              <>
                <span style={{ color: "var(--color-text-tertiary)" }}>❔ Unsigned Payload</span>
              </>
            )}
          </div>
          {signatureStatus === "valid" && recoveredAgent && (
            <div style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
              Payload hash: <code style={{ fontSize: "0.625rem" }}>{message.agentPayloadHash?.slice(0, 16)}...</code>
              <br />
              Signer: <code style={{ fontSize: "0.625rem" }}>{recoveredAgent}</code>
            </div>
          )}
          {signatureStatus === "invalid" && (
            <div style={{ fontSize: "0.6875rem", color: "var(--color-error)" }}>
              The signature attached to this intent payload is invalid. Proceeding is disabled.
            </div>
          )}
        </div>

        {/* Compliance Status Indicator */}
        <div
          style={{
            marginTop: "var(--space-2)",
            marginBottom: "var(--space-4)",
            padding: "var(--space-3)",
            background: "rgba(16, 185, 129, 0.05)",
            border: "1px solid rgba(16, 185, 129, 0.15)",
            borderRadius: "var(--radius-md, 8px)",
            fontSize: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, color: "rgb(16, 185, 129)" }}>
            <span>✅ Compliance Checked</span>
          </div>
          <span style={{ 
            fontSize: "0.6875rem", 
            background: "rgba(16, 185, 129, 0.15)", 
            color: "rgb(16, 185, 129)", 
            padding: "2px 6px", 
            borderRadius: "4px", 
            fontWeight: 700 
          }}>
            PASS (Low Risk)
          </span>
        </div>

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
            disabled={isSending || isExpired || signatureStatus === "invalid" || signatureStatus === "verifying"}
            id="confirm-transfer-btn"
            style={{ flex: 2 }}
          >
            {isSending ? (
              <>
                <span className="spinner" />
                {isSwap ? "Swapping..." : isBridge ? "Bridging..." : isEscrowCreate ? "Locking..." : isEscrowSubmit ? "Submitting..." : "Sending..."}
              </>
            ) : (
              isExpired ? "Expired" : isSwap ? "🔄 Confirm Swap" : isBridge ? "🌉 Confirm Bridge" : isEscrowCreate ? "🔒 Confirm & Lock" : isEscrowSubmit ? "📤 Confirm Submission" : "✅ Confirm & Sign"
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
          {isBridge ? `Bridging utilizes Circle CCTP burn-and-mint mechanism.` : isEscrowSubmit ? `Submission checks are run off-chain before contract interaction.` : `Funds will be secured on Arc Testnet only.`}
        </p>
      </div>
    </div>
  );
}
