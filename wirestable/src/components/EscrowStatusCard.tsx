"use client";

import React, { useState } from "react";

interface EscrowStatusCardProps {
  jobId: number;
  client: string;
  provider: string;
  evaluator: string;
  amount: number; // in USDC
  status: "FUNDED" | "SUBMITTED" | "COMPLETED" | "REJECTED";
  deliverableHash: string;
  deliverableUrl: string;
  expiry: number; // UNIX timestamp
  onSubmitDeliverable: (jobId: number, url: string) => Promise<any>;
  onRelease: (jobId: number) => Promise<any>;
  onDispute: (jobId: number) => Promise<any>;
  userAddress?: string;
}

export function EscrowStatusCard({
  jobId,
  client,
  provider,
  evaluator,
  amount,
  status,
  deliverableHash,
  deliverableUrl,
  expiry,
  onSubmitDeliverable,
  onRelease,
  onDispute,
  userAddress = ""
}: EscrowStatusCardProps) {
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address logic: determine role
  const isClient = userAddress.toLowerCase() === client.toLowerCase();
  const isProvider = userAddress.toLowerCase() === provider.toLowerCase();

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl.startsWith("http")) {
      setError("Delivery proof must be a valid HTTP or HTTPS hyperlink.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmitDeliverable(jobId, submissionUrl);
    } catch (err: any) {
      setError(err.message || "Failed to submit deliverable");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors = {
    FUNDED: { bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.25)", text: "#f59e0b", badge: "Funded & Secured" },
    SUBMITTED: { bg: "rgba(59, 130, 246, 0.08)", border: "rgba(59, 130, 246, 0.25)", text: "#3b82f6", badge: "Submitted / Verifying" },
    COMPLETED: { bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.25)", text: "#10b981", badge: "Released & Settled" },
    REJECTED: { bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.25)", text: "#ef4444", badge: "Under Dispute" }
  };

  const currentConfig = statusColors[status] || statusColors.FUNDED;

  const isExpired = Date.now() / 1000 > expiry;

  return (
    <div
      className="card"
      style={{
        padding: "var(--space-5)",
        background: currentConfig.bg,
        border: `1px solid ${currentConfig.border}`,
        borderRadius: "var(--radius-lg)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Visual glowing aura badge */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${currentConfig.border} 0%, transparent 70%)`,
          pointerEvents: "none"
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
        <div>
          <span
            style={{
              background: "rgba(255,255,255,0.05)",
              color: currentConfig.text,
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "4px 10px",
              borderRadius: "999px",
              border: `1px solid ${currentConfig.border}`
            }}
          >
            Escrow Job #{jobId}
          </span>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "var(--space-2)", color: "var(--color-text-primary)" }}>
            ERC-8183 Labor Agreement
          </h4>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>Locked Vault</span>
          <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--color-primary)" }}>
            {amount} USDC
          </div>
        </div>
      </div>

      {/* Labor State Stepper */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "var(--space-4) 0", padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: status !== "REJECTED" ? 1 : 0.4 }}>
          <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#f59e0b", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold" }}>1</span>
          <span style={{ fontSize: "10px", color: "var(--color-text-secondary)", marginTop: "4px" }}>Funded</span>
        </div>
        <div style={{ flex: 1, height: "2px", background: status !== "FUNDED" && status !== "REJECTED" ? "#3b82f6" : "rgba(255,255,255,0.1)", margin: "0 8px", marginTop: "-12px" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: status !== "FUNDED" && status !== "REJECTED" ? 1 : 0.4 }}>
          <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: status === "SUBMITTED" || status === "COMPLETED" ? "#3b82f6" : "rgba(255,255,255,0.1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold" }}>2</span>
          <span style={{ fontSize: "10px", color: "var(--color-text-secondary)", marginTop: "4px" }}>Submitted</span>
        </div>
        <div style={{ flex: 1, height: "2px", background: status === "COMPLETED" ? "#10b981" : "rgba(255,255,255,0.1)", margin: "0 8px", marginTop: "-12px" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: status === "COMPLETED" ? 1 : 0.4 }}>
          <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: status === "COMPLETED" ? "#10b981" : "rgba(255,255,255,0.1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold" }}>3</span>
          <span style={{ fontSize: "10px", color: "var(--color-text-secondary)", marginTop: "4px" }}>Settled</span>
        </div>
      </div>

      {/* Metadata Roles */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Client (Employer):</span>
          <span className="text-mono">{client.slice(0, 8)}...{client.slice(-6)} {isClient && " (You)"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Provider (Freelancer):</span>
          <span className="text-mono">{provider.slice(0, 8)}...{provider.slice(-6)} {isProvider && " (You)"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Evaluator (Compliance):</span>
          <span className="text-mono">{evaluator.slice(0, 8)}...{evaluator.slice(-6)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Task description:</span>
          <span className="text-mono" title={deliverableHash}>{deliverableHash.slice(0, 14)}...</span>
        </div>
        {deliverableUrl && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", padding: "6px 8px", background: "rgba(0,0,0,0.15)", borderRadius: "var(--radius-sm)" }}>
            <span>Submission Link:</span>
            <a
              href={deliverableUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-primary)", textDecoration: "underline" }}
            >
              {deliverableUrl.replace("https://", "").slice(0, 24)}...
            </a>
          </div>
        )}
      </div>

      {/* Interface Logic based on state */}
      {status === "FUNDED" && (
        <div>
          {isProvider ? (
            <form onSubmit={handleUrlSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "4px" }}>
                  SUBMIT DELIVERABLE LINK (GitHub, Figma, Vercel, or Google Drive)
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/freelancer/my-project"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "var(--color-bg-secondary)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "var(--radius-sm)",
                    color: "#fff",
                    fontSize: "0.8125rem"
                  }}
                />
              </div>

              {error && <div style={{ fontSize: "0.75rem", color: "#ef4444" }}>{error}</div>}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !submissionUrl}
                style={{ width: "100%" }}
              >
                {isSubmitting ? "Verifying..." : "📤 Submit & Trigger Auto-Release"}
              </button>
            </form>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", textAlign: "center", padding: "10px 0" }}>
                ⏳ Waiting for Freelancer submission...
              </div>
              {isClient && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => onRelease(jobId)}
                    style={{ flex: 1, padding: "8px", fontSize: "0.75rem" }}
                  >
                    🔓 Manual Release
                  </button>
                  <button
                    className="btn"
                    onClick={() => onDispute(jobId)}
                    style={{ flex: 1, padding: "8px", fontSize: "0.75rem", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444" }}
                  >
                    ⚠️ Dispute Job
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {status === "SUBMITTED" && (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div className="spinner-mini" style={{ margin: "0 auto 8px" }} />
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
            Autonomous compliance agent is validating delivery proof...
          </span>
        </div>
      )}

      {status === "COMPLETED" && (
        <div style={{ textAlign: "center", padding: "8px 0", background: "rgba(16, 185, 129, 0.1)", borderRadius: "var(--radius-sm)" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#10b981" }}>
            ✓ Escrow Settled & Funds Payout Released!
          </span>
        </div>
      )}

      {status === "REJECTED" && (
        <div style={{ textAlign: "center", padding: "8px 0", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--radius-sm)" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#ef4444" }}>
            ⚠️ Agreement in Dispute. Treasury locked.
          </span>
        </div>
      )}
    </div>
  );
}
