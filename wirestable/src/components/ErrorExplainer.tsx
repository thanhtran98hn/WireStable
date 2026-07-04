"use client";

import type { ChatMessage } from "@/types";
import { WarningIcon } from "@/components/icons/CustomIcons";

interface ErrorExplainerProps {
  message: ChatMessage;
}

export function ErrorExplainer({ message }: ErrorExplainerProps) {
  const { errorDetails } = message;

  if (!errorDetails) return null;

  return (
    <div className="chat-bubble chat-bubble-ai" style={{ maxWidth: "480px" }}>
      <div className="error-card">
        <div className="error-card-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <WarningIcon size={14} className="text-[var(--color-error)]" /> Error {errorDetails.code}: {errorDetails.title}
        </div>
        <div className="error-card-message">
          <p style={{ marginBottom: "var(--space-3)" }}>
            <strong>What happened:</strong>
            <br />
            {errorDetails.explanation}
          </p>
          <p>
            <strong>How to fix it:</strong>
            <br />
            {errorDetails.suggestion}
          </p>
        </div>

        {/* MCP badge */}
        <div
          style={{
            marginTop: "var(--space-3)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            fontSize: "0.6875rem",
            color: "var(--color-text-tertiary)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--color-info)",
            }}
          />
          Powered by Circle MCP Documentation
        </div>
      </div>
    </div>
  );
}
