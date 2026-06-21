import { useEffect, useState } from "react";

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
  address?: string | null;
}

const SUGGESTIONS = [
  "Send 10 USDC to 0x742d...f44e",
  "What is error 155104?",
  "How does Arc Testnet work?",
  "Help me transfer USDC",
];

export function EmptyState({ onSuggestionClick, address }: EmptyStateProps) {
  const [unifiedBal, setUnifiedBal] = useState<number | null>(null);

  useEffect(() => {
    if (address) {
      fetch(`/api/gateway/balance?address=${address}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUnifiedBal(data.unifiedBalance);
          }
        })
        .catch((err) => console.error("Error loading onboarding balance summary:", err));
    } else {
      setUnifiedBal(25.00); // Seed onboarding sandbox balance
    }
  }, [address]);

  return (
    <div className="empty-state">
      <div className="empty-state-icon">💸</div>
      <h2 className="empty-state-title">Welcome to WireStable</h2>
      
      {unifiedBal !== null && (
        <div
          style={{
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "12px 18px",
            marginTop: "12px",
            marginBottom: "12px",
            textAlign: "center",
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <span style={{ fontSize: "0.725rem", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
            {address ? "🔗 Circle Gateway Connected" : "🧪 Circle Gateway (Sandbox Demo)"}
          </span>
          <strong style={{ fontSize: "1.1rem", color: "var(--color-text-primary)", marginTop: "4px" }}>
            Unified Portfolio: {unifiedBal.toFixed(2)} USDC
          </strong>
          <span style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
            {address ? "Funds pooled globally across Sepolia, Base, and Solana Devnet" : "Showing simulated multi-chain pool balance across testnets"}
          </span>
        </div>
      )}

      <p className="empty-state-desc">
        Your AI-powered remittance assistant. Send USDC on Arc Testnet using
        natural language — just type or speak your transfer instructions.
      </p>

      {/* Feature highlights */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--space-3)",
          width: "100%",
          maxWidth: "600px",
          marginTop: "var(--space-4)",
        }}
      >
        <FeatureChip icon="💬" label="Chat to Pay" desc="Type or speak to send USDC" />
        <FeatureChip icon="🔍" label="Error Explainer" desc="Ask about any tx error" />
        <FeatureChip icon="📡" label="Live Tracking" desc="Real-time tx updates" />
        <FeatureChip icon="🎤" label="Voice Transfer" desc="Speak your command" />
      </div>

      {/* Quick suggestions */}
      <div style={{ marginTop: "var(--space-6)" }}>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-tertiary)",
            marginBottom: "var(--space-3)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 600,
          }}
        >
          Try saying...
        </p>
        <div className="empty-state-suggestions">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              className="suggestion-chip"
              onClick={() => onSuggestionClick(s)}
              id={`suggestion-${s.slice(0, 10).replace(/\s/g, "-").toLowerCase()}`}
            >
              &ldquo;{s}&rdquo;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureChip({
  icon,
  label,
  desc,
}: {
  icon: string;
  label: string;
  desc: string;
}) {
  return (
    <div className="feature-chip">
      <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>{icon}</span>
      <div>
        <div
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "0.6875rem",
            color: "var(--color-text-tertiary)",
            marginTop: "2px",
          }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
}
