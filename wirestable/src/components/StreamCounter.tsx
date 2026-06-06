"use client";

import React, { useState, useEffect, useRef } from "react";

interface StreamCounterProps {
  streamId: number;
  sender: string;
  recipient: string;
  amountPerSecond: number; // in micro-USDC (6 decimals)
  startTime: number; // UNIX timestamp in seconds
  stopTime: number; // UNIX timestamp in seconds
  remainingBalance: number; // in micro-USDC (6 decimals)
  lastWithdrawalTime: number; // UNIX timestamp in seconds
  onWithdraw: (streamId: number) => Promise<any>;
  isWithdrawing: boolean;
}

export function StreamCounter({
  streamId,
  sender,
  recipient,
  amountPerSecond,
  startTime,
  stopTime,
  remainingBalance,
  lastWithdrawalTime,
  onWithdraw,
  isWithdrawing,
}: StreamCounterProps) {
  const [displayBalance, setDisplayBalance] = useState<string>("0.000000");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Rate in USDC per second
  const usdcRatePerSecond = amountPerSecond / 1e6;

  useEffect(() => {
    const updateTicker = () => {
      const now = Date.now() / 1000;
      
      if (now <= lastWithdrawalTime) {
        setDisplayBalance("0.000000");
        return;
      }

      // Calculate elapsed seconds since last withdrawal
      const activeEnd = Math.min(now, stopTime);
      const elapsed = activeEnd - lastWithdrawalTime;
      
      if (elapsed <= 0) {
        setDisplayBalance("0.000000");
        return;
      }

      // Calculate accrued amount in micro-USDC
      const accruedMicro = elapsed * amountPerSecond;
      
      // Cap at remaining stream balance
      const finalMicro = Math.min(accruedMicro, remainingBalance);
      
      // Format to 6 decimal places (USDC standard precision)
      setDisplayBalance((finalMicro / 1e6).toFixed(6));
    };

    updateTicker();
    
    // Ticking every 50ms for ultra-smooth fluid counter animation (Superfluid style)
    intervalRef.current = setInterval(updateTicker, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [amountPerSecond, lastWithdrawalTime, stopTime, remainingBalance]);

  const progressPercent = (() => {
    const totalDuration = stopTime - startTime;
    if (totalDuration <= 0) return 100;
    const now = Date.now() / 1000;
    const elapsed = Math.max(0, Math.min(now - startTime, totalDuration));
    return (elapsed / totalDuration) * 100;
  })();

  return (
    <div
      className="card"
      style={{
        padding: "var(--space-5)",
        background: "rgba(59, 130, 246, 0.03)",
        border: "1px solid rgba(59, 130, 246, 0.15)",
        borderRadius: "var(--radius-lg)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Decorative gradient aura */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          pointerEvents: "none"
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
        <div>
          <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Active Stream #{streamId}
          </span>
          <h4 style={{ fontSize: "0.875rem", fontWeight: 700, marginTop: "var(--space-2)", color: "var(--color-text-primary)" }}>
            Continuous Salary Stream
          </h4>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>Flow Rate</span>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
            ~{(usdcRatePerSecond * 3600).toFixed(4)} USDC/hr
          </div>
        </div>
      </div>

      {/* Main Counter Display */}
      <div style={{ textAlign: "center", padding: "var(--space-4) 0", background: "rgba(0,0,0,0.15)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-4)" }}>
        <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Unclaimed Balance
        </span>
        <div
          className="text-mono"
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "var(--color-primary)",
            margin: "6px 0",
            letterSpacing: "-0.02em"
          }}
        >
          {displayBalance} <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--color-text-secondary)" }}>USDC</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--color-text-tertiary)", marginBottom: "6px" }}>
          <span>Stream Progress</span>
          <span>{progressPercent.toFixed(1)}%</span>
        </div>
        <div style={{ width: "100%", height: "6px", background: "var(--color-bg-secondary)", borderRadius: "3px", overflow: "hidden" }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "linear-gradient(90deg, var(--color-primary) 0%, #60a5fa 100%)",
              borderRadius: "3px",
              transition: "width 0.5s ease"
            }}
          />
        </div>
      </div>

      {/* Metadata */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Sender:</span>
          <span className="text-mono">{sender.slice(0, 8)}...{sender.slice(-6)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Recipient:</span>
          <span className="text-mono">{recipient.slice(0, 8)}...{recipient.slice(-6)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Ends At:</span>
          <span>{new Date(stopTime * 1000).toLocaleString()}</span>
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={() => onWithdraw(streamId)}
        disabled={isWithdrawing || parseFloat(displayBalance) <= 0}
        style={{ width: "100%" }}
      >
        {isWithdrawing ? "Signing Withdrawal..." : "⚡ Withdraw Accrued Earnings"}
      </button>
    </div>
  );
}
