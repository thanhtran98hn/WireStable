"use client";

import React, { useState } from "react";

export function LPAnalytics() {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [tvl, setTvl] = useState(450000);
  const [myLiquidity, setMyLiquidity] = useState(25000);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      setTvl((prev) => prev + amt);
      setMyLiquidity((prev) => prev + amt);
      setDepositAmount("");
      setIsProcessing(false);
    }, 1000);
  };

  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0 || amt > myLiquidity) return;
    setIsProcessing(true);
    setTimeout(() => {
      setTvl((prev) => prev - amt);
      setMyLiquidity((prev) => prev - amt);
      setWithdrawAmount("");
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontSize: "1.25rem" }}>🌊</span>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>FX Hedging reserves & Maker Routing</h3>
        </div>
        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          Provide reserves to USDC-EURC remittance corridor pools to cover rate deviation claims and earn maker fees.
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
        <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "12px" }}>
          <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>Corridor TVL</span>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "4px", color: "var(--color-text-primary)" }}>
            {tvl.toLocaleString()} USDC
          </div>
        </div>

        <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "12px" }}>
          <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>Pool APY</span>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "4px", color: "var(--color-success)" }}>
            12.45%
          </div>
        </div>

        <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "12px" }}>
          <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>Your Deposit</span>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "4px", color: "var(--color-accent)" }}>
            {myLiquidity.toLocaleString()} USDC
          </div>
        </div>
      </div>

      {/* Hedging Rate Chart (SVG) */}
      <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>24-Hour Rate Lock vs Spot (USDC/EURC)</span>
          <div style={{ display: "flex", gap: "10px", fontSize: "0.6875rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", background: "var(--color-accent)", borderRadius: "50%" }} />
              Locked (0.9245)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", background: "var(--color-error)", borderRadius: "50%" }} />
              Spot FX
            </span>
          </div>
        </div>

        <div style={{ height: "120px", position: "relative" }}>
          <svg viewBox="0 0 200 80" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: "visible" }}>
            {/* Grid Line */}
            <line x1="0" y1="40" x2="200" y2="40" stroke="var(--color-border)" strokeDasharray="3" />
            
            {/* Locked rate line (constant) */}
            <line x1="0" y1="35" x2="200" y2="35" stroke="var(--color-accent)" strokeWidth="2.5" />
            
            {/* Spot rate line (fluctuating) */}
            <path
              d="M0,40 C30,30 50,55 80,45 C110,35 130,60 160,38 T200,48"
              fill="none"
              stroke="var(--color-error)"
              strokeWidth="2"
            />
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.625rem", color: "var(--color-text-tertiary)", marginTop: "6px" }}>
            <span>-24 Hours</span>
            <span>-12 Hours</span>
            <span>Now</span>
          </div>
        </div>
      </div>

      {/* LP Deposit/Withdraw Form */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>Deposit reserves</span>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              type="number"
              placeholder="Amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              style={{
                width: "100%",
                background: "var(--color-bg-secondary)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "0.8125rem"
              }}
            />
            <button
              onClick={handleDeposit}
              className="btn btn-primary btn-sm"
              disabled={isProcessing}
            >
              {isProcessing ? "..." : "Deposit"}
            </button>
          </div>
        </div>

        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>Withdraw reserves</span>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              type="number"
              placeholder="Amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              style={{
                width: "100%",
                background: "var(--color-bg-secondary)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "0.8125rem"
              }}
            />
            <button
              onClick={handleWithdraw}
              className="btn btn-secondary btn-sm"
              disabled={isProcessing || myLiquidity === 0}
            >
              {isProcessing ? "..." : "Withdraw"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
