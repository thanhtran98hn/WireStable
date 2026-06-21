"use client";

import React, { useState } from "react";

interface YieldAnalyticsProps {
  autoSweep: boolean;
  usycBalance: string;
  accruedYield: string;
  onToggleSweep: (enabled: boolean) => Promise<any>;
  isUpdating?: boolean;
}

export function YieldAnalytics({
  autoSweep,
  usycBalance,
  accruedYield,
  onToggleSweep,
  isUpdating = false,
}: YieldAnalyticsProps) {
  const [toggleLoading, setToggleLoading] = useState(false);

  const handleToggle = async () => {
    setToggleLoading(true);
    try {
      await onToggleSweep(!autoSweep);
    } catch (e) {
      console.error("Auto-sweep update failed:", e);
    } finally {
      setToggleLoading(false);
    }
  };

  const parsedUsyc = parseFloat(usycBalance);
  const parsedYield = parseFloat(accruedYield);
  const isHolding = parsedUsyc > 0;

  // Custom SVG coordinates for yield tracking (projected target or actual yield curve)
  const linePoints = "0,65 20,58 40,52 60,45 80,32 100,18 120,5";
  const areaPoints = "0,65 20,58 40,52 60,45 80,32 100,18 120,5 120,75 0,75";

  return (
    <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", padding: "24px", minHeight: "340px" }}>
      {/* Configuration & Sweep Toggle */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "1.25rem" }}>💼</span>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Treasury Cash Sweep</h3>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: "16px" }}>
            Sweep idle corporate USDC cash automatically into Circle's yield-bearing USYC token to offset inflation.
          </p>

          <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, display: "block" }}>Auto-Sweep Yield Rule</span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>Sweeps 80% of idle treasury USDC</span>
              </div>
              <button 
                onClick={handleToggle}
                disabled={toggleLoading || isUpdating}
                style={{
                  background: autoSweep ? "var(--color-primary)" : "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  borderRadius: "20px",
                  width: "52px",
                  height: "28px",
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  padding: 0
                }}
              >
                <div style={{
                  background: "#fff",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  position: "absolute",
                  top: "4px",
                  left: autoSweep ? "28px" : "4px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }} />
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
              <span style={{ fontSize: "0.6875rem", background: "rgba(52, 211, 153, 0.1)", color: "#34d399", padding: "4px 8px", borderRadius: "6px", fontWeight: 600 }}>
                APY: 5.15%
              </span>
              <span style={{ fontSize: "0.6875rem", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", padding: "4px 8px", borderRadius: "6px", fontWeight: 600 }}>
                Token: USYC
              </span>
              <span style={{ fontSize: "0.6875rem", background: "rgba(251, 191, 36, 0.1)", color: "#fbbf24", padding: "4px 8px", borderRadius: "6px", fontWeight: 600 }}>
                Auto-Redemption: Active
              </span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: "12px" }}>
          ⚠️ Payout fallback is active: USYC will be automatically redeemed back to USDC if liquid balance is insufficient for disbursals.
        </div>
      </div>

      {/* Yield Accrual Graph & Analytics */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--color-border)", borderRadius: "16px", padding: "20px" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>USYC Portfolio Balance</span>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, display: "block", color: "var(--color-text-primary)", marginTop: "4px" }}>
                {parsedUsyc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USYC
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", textTransform: "uppercase" }}>Accrued Yield</span>
              <span style={{ fontSize: "1.125rem", fontWeight: 700, display: "block", color: "#34d399", marginTop: "4px", fontFamily: "monospace" }}>
                +{parsedYield.toFixed(8)} USDC
              </span>
            </div>
          </div>

          {/* SVG Sparkline Yield Curve Chart */}
          <div style={{ height: "90px", marginTop: "16px", position: "relative" }}>
            <svg viewBox="0 0 120 80" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Fill Area under Curve */}
              <polygon points={areaPoints} fill="url(#yieldGrad)" style={{ transition: "points 0.5s ease", opacity: isHolding ? 1 : 0.2 }} />
              {/* Line Stroke */}
              <polyline
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
                points={linePoints}
                strokeDasharray={isHolding ? undefined : "3 3"}
                style={{ transition: "points 0.5s ease", opacity: isHolding ? 1 : 0.4 }}
              />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.625rem", color: "var(--color-text-tertiary)", marginTop: "6px" }}>
              <span>6 Days Ago</span>
              <span>4 Days Ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Real-time yield corridor activity notice */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(52, 211, 153, 0.05)", border: "1px solid rgba(52, 211, 153, 0.15)", borderRadius: "8px", padding: "8px 12px", marginTop: "12px" }}>
          <span style={{ display: "inline-block", width: "8px", height: "8px", background: isHolding ? "#34d399" : "rgba(255, 255, 255, 0.2)", borderRadius: "50%", animation: isHolding ? "pulse 2s infinite" : "none" }} />
          <span style={{ fontSize: "0.75rem", color: isHolding ? "#34d399" : "var(--color-text-secondary)", fontWeight: 600 }}>
            {isHolding ? "Yield Accruing (5.15% APY compounding)" : "Yield Idle (Awaiting funds)"}
          </span>
        </div>
      </div>
    </div>
  );
}
