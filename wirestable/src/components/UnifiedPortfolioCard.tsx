"use client";

import React from "react";

export interface ContributingChain {
  chain: string;
  balance: number;
  address: string;
}

interface UnifiedPortfolioCardProps {
  unifiedBalance: number;
  chains: ContributingChain[];
}

export function UnifiedPortfolioCard({ unifiedBalance, chains }: UnifiedPortfolioCardProps) {
  // Helper to format chain display name
  const formatChainName = (name: string) => {
    switch (name) {
      case "Arc_Testnet":
        return "⚡ Arc Testnet";
      case "Base_Sepolia":
        return "🔵 Base Sepolia";
      case "Ethereum_Sepolia":
        return "💎 Ethereum Sepolia";
      case "Solana_Devnet":
        return "☀️ Solana Devnet";
      default:
        return name;
    }
  };

  // Helper to get chain colors
  const getChainColor = (name: string) => {
    switch (name) {
      case "Arc_Testnet":
        return "rgb(16, 185, 129)"; // emerald-500
      case "Base_Sepolia":
        return "rgb(59, 130, 246)"; // blue-500
      case "Ethereum_Sepolia":
        return "rgb(139, 92, 246)"; // purple-500
      case "Solana_Devnet":
        return "rgb(20, 184, 166)"; // teal-500
      default:
        return "rgb(107, 114, 128)";
    }
  };

  return (
    <div
      className="unified-portfolio-card"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "var(--radius-lg, 16px)",
        padding: "var(--space-5, 20px)",
        maxWidth: "460px",
        margin: "12px 0",
        color: "var(--color-text-primary, #f3f4f6)",
        fontFamily: "var(--font-sans, system-ui)",
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}
    >
      {/* Card Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.25rem" }}>💼</span>
          <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
            Unified Stablecoin Portfolio
          </h4>
        </div>
        <span
          style={{
            background: "rgba(59, 130, 246, 0.1)",
            color: "rgb(147, 197, 253)",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "0.6875rem",
            fontWeight: 700
          }}
        >
          Circle Gateway
        </span>
      </div>

      {/* Aggregate Balance */}
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary, #9ca3af)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Total Unified Balance
        </span>
        <h2 style={{ margin: "4px 0 0 0", fontSize: "2.25rem", fontWeight: 800, color: "#ffffff" }}>
          {unifiedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
          <span style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--color-text-secondary, #9ca3af)" }}>USDC</span>
        </h2>
      </div>

      {/* Dynamic Segment Allocation Bar */}
      <div
        style={{
          height: "8px",
          width: "100%",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "4px",
          display: "flex",
          overflow: "hidden"
        }}
      >
        {chains.map((c, idx) => {
          const percentage = unifiedBalance > 0 ? (c.balance / unifiedBalance) * 100 : 0;
          if (percentage <= 0) return null;
          return (
            <div
              key={idx}
              style={{
                width: `${percentage}%`,
                height: "100%",
                backgroundColor: getChainColor(c.chain),
                transition: "width 0.3s ease"
              }}
              title={`${c.chain}: ${percentage.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Breakdown per Chain */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
        {chains.map((c, idx) => {
          const percentage = unifiedBalance > 0 ? (c.balance / unifiedBalance) * 100 : 0;
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.8125rem",
                padding: "6px 8px",
                background: "rgba(255, 255, 255, 0.01)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.02)"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontWeight: 600, color: "#ffffff" }}>{formatChainName(c.chain)}</span>
                <span style={{ fontSize: "0.6875rem", fontFamily: "monospace", color: "var(--color-text-secondary, #9ca3af)" }}>
                  {c.address.slice(0, 6)}...{c.address.slice(-4)}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <strong style={{ color: "#ffffff", display: "block" }}>
                  {c.balance.toFixed(2)} USDC
                </strong>
                <span style={{ fontSize: "0.6875rem", color: getChainColor(c.chain), fontWeight: 700 }}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notice */}
      <div
        style={{
          background: "rgba(59, 130, 246, 0.03)",
          border: "1px solid rgba(59, 130, 246, 0.1)",
          borderRadius: "8px",
          padding: "10px",
          fontSize: "0.725rem",
          color: "rgb(191, 219, 254)",
          lineHeight: 1.4
        }}
      >
        ℹ️ <strong>Auto-Routing Enabled</strong>: WireStable automatically routes payments through CCTP if your Arc balance is insufficient, pulling required funds from funding chains.
      </div>
    </div>
  );
}
