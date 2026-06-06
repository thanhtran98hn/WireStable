"use client";

import React, { useState, useEffect, useRef } from "react";

interface AgentIdentity {
  agentName: string;
  ipfsHashMetadata: string;
  registryAddress: string;
  agentAddress: string;
  reputationRating: number;
}

export function AgentIdentityBadge() {
  const [isOpen, setIsOpen] = useState(false);
  const [agent, setAgent] = useState<AgentIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchIdentity = async () => {
    try {
      const res = await fetch("/api/agent/identity");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAgent({
            agentName: data.agentName,
            ipfsHashMetadata: data.ipfsHashMetadata,
            registryAddress: data.registryAddress,
            agentAddress: data.agentAddress,
            reputationRating: data.reputationRating,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load agent identity details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdentity();

    // Close on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleVote = async (action: "upvote" | "downvote") => {
    if (!agent || voting) return;
    setVoting(true);
    try {
      const res = await fetch("/api/agent/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAgent((prev) => prev ? { ...prev, reputationRating: data.reputationRating } : null);
        }
      }
    } catch (err) {
      console.error("Rating request failed", err);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="agent-badge-skeleton" style={{ width: "120px", height: "28px", background: "rgba(0,0,0,0.05)", borderRadius: "20px" }} />
    );
  }

  if (!agent) return null;

  return (
    <div style={{ position: "relative" }} ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="agent-badge-trigger"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          borderRadius: "20px",
          padding: "5px 12px",
          cursor: "pointer",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "rgb(16, 185, 129)",
          transition: "all 0.2s ease",
          outline: "none"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(16, 185, 129, 0.12)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(16, 185, 129, 0.08)";
          e.currentTarget.style.transform = "none";
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "rgb(16, 185, 129)",
            display: "inline-block",
            animation: "agent-pulse 2s infinite"
          }}
        />
        <span>ERC-8004 Agent Registered</span>
      </button>

      {isOpen && (
        <div
          className="agent-identity-popover"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 100,
            width: "320px",
            background: "var(--color-bg-primary, #ffffff)",
            border: "1px solid var(--color-border, #e5e7eb)",
            borderRadius: "var(--radius-lg, 12px)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.06)",
            padding: "var(--space-4, 16px)",
            fontFamily: "var(--font-sans, system-ui)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            animation: "slide-down-fade 0.2s ease-out"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
            <div>
              <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                {agent.agentName}
              </h4>
              <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
                Autonomous Remittance Assistant
              </span>
            </div>
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                color: "rgb(16, 185, 129)",
                borderRadius: "4px",
                padding: "2px 6px",
                fontSize: "0.6875rem",
                fontWeight: 700,
                marginLeft: "auto"
              }}
            >
              Active
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Registry Contract</span>
              <span
                style={{ fontFamily: "monospace", color: "var(--color-text-primary)" }}
                title={agent.registryAddress}
              >
                {agent.registryAddress.slice(0, 6)}...{agent.registryAddress.slice(-4)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Agent Wallet Address</span>
              <span
                style={{ fontFamily: "monospace", color: "var(--color-text-primary)" }}
                title={agent.agentAddress}
              >
                {agent.agentAddress.slice(0, 6)}...{agent.agentAddress.slice(-4)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>IPFS Capabilities CID</span>
              <a
                href={`https://ipfs.io/ipfs/${agent.ipfsHashMetadata.replace("ipfs://", "")}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--color-primary)", textDecoration: "underline" }}
                title={agent.ipfsHashMetadata}
              >
                {agent.ipfsHashMetadata.slice(7, 13)}...
              </a>
            </div>
          </div>

          <div
            style={{
              background: "rgba(0,0,0,0.02)",
              borderRadius: "8px",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px dashed var(--color-border)"
            }}
          >
            <div>
              <span style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", display: "block" }}>
                ERC-8004 Reputation Score
              </span>
              <strong style={{ fontSize: "1.125rem", color: "var(--color-text-primary)" }}>
                {agent.reputationRating}
              </strong>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => handleVote("upvote")}
                disabled={voting}
                style={{
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.15)",
                  color: "rgb(16, 185, 129)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  transition: "all 0.1s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(16, 185, 129, 0.08)"}
              >
                👍 Upvote
              </button>
              <button
                onClick={() => handleVote("downvote")}
                disabled={voting}
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                  color: "rgb(239, 68, 68)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  transition: "all 0.1s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"}
              >
                👎 Downvote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Define CSS keyframes using JSX style tag to avoid bloating main.css */}
      <style jsx global>{`
        @keyframes agent-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
        @keyframes slide-down-fade {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
