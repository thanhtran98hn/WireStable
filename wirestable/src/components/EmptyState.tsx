"use client";

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SUGGESTIONS = [
  "Send 10 USDC to 0x742d...f44e",
  "What is error 155104?",
  "How does Arc Testnet work?",
  "Help me transfer USDC",
];

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">💸</div>
      <h2 className="empty-state-title">Welcome to WireStable</h2>
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
