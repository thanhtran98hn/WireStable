"use client";

import React, { useState, useEffect } from "react";
import { BoltIcon } from "@/components/icons/CustomIcons";

interface NetworkEvent {
  id: string;
  timestamp: string;
  type: "transfer" | "bridge" | "yield" | "escrow" | "compliance" | "stream";
  message: string;
  txHash: string;
  amount?: string;
  gasSponsored?: string;
}

const EVENT_POOL: Omit<NetworkEvent, "id" | "timestamp" | "txHash">[] = [
  {
    type: "transfer",
    message: "Gasless USDC transfer to 0x7397...7fbc confirmed",
    amount: "45.00 USDC",
    gasSponsored: "0.00035 ARC"
  },
  {
    type: "bridge",
    message: "CCTP Bridge Deposit from Arbitrum Sepolia detected",
    amount: "1,200.00 USDC"
  },
  {
    type: "compliance",
    message: "AML Screen passed for transfer to 0xa2b2...2b2b (Score: 97%)"
  },
  {
    type: "yield",
    message: "Auto-sweep executed: excess reserves transferred to USYC Vault",
    amount: "15,420.00 USDC"
  },
  {
    type: "stream",
    message: "Salary Stream #14 initialized to contractor 0x902a...1108",
    amount: "600.00 USDC/wk"
  },
  {
    type: "escrow",
    message: "Work Escrow #8 released. 350.00 USDC disbursed",
    amount: "350.00 USDC",
    gasSponsored: "0.00052 ARC"
  },
  {
    type: "transfer",
    message: "Gasless EURC payout to merchant 0x5c79...32a1 complete",
    amount: "89.90 EURC",
    gasSponsored: "0.00028 ARC"
  },
  {
    type: "bridge",
    message: "CCTP Transfer initiated: Arc Testnet to Base Sepolia",
    amount: "250.00 USDC"
  },
  {
    type: "compliance",
    message: "Sanction screening completed for sweep recipient (Score: 99%)"
  },
  {
    type: "yield",
    message: "Yield accrued: USYC balance increased by 4.28 USDC"
  }
];

function generateRandomTxHash(): string {
  return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export function NetworkActivityFeed() {
  const [events, setEvents] = useState<NetworkEvent[]>([]);

  useEffect(() => {
    // Generate initial pre-populated events so it's not empty on load
    const initialEvents: NetworkEvent[] = Array.from({ length: 4 }).map((_, idx) => {
      const poolItem = EVENT_POOL[idx % EVENT_POOL.length];
      const date = new Date(Date.now() - (idx + 1) * 45 * 1000);
      return {
        id: `init-${idx}`,
        timestamp: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        txHash: generateRandomTxHash(),
        ...poolItem
      };
    });
    setEvents(initialEvents);

    // Dynamic feed updates every 6 seconds
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * EVENT_POOL.length);
      const poolItem = EVENT_POOL[randomIndex];
      const now = new Date();
      const newEvent: NetworkEvent = {
        id: `event-${Date.now()}`,
        timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        txHash: generateRandomTxHash(),
        ...poolItem
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 4)]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: NetworkEvent["type"]) => {
    switch (type) {
      case "transfer": return "var(--color-success)";
      case "bridge": return "var(--color-primary)";
      case "yield": return "#a78bfa"; // Violet-400
      case "escrow": return "#f59e0b"; // Amber-500
      case "compliance": return "#38bdf8"; // Sky-400
      case "stream": return "#ec4899"; // Pink-500
      default: return "var(--color-text-secondary)";
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: "var(--space-4)",
        background: "rgba(255, 255, 255, 0.01)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        minWidth: "260px",
        maxHeight: "360px",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
        <h4 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ position: "relative", display: "flex", height: "8px", width: "8px" }}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-8 w-8 bg-emerald-500" style={{ width: "8px", height: "8px" }}></span>
          </span>
          Global Network Feed
        </h4>
        <span style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}>Arc Testnet</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", flex: 1 }}>
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              fontSize: "0.7rem",
              background: "rgba(255, 255, 255, 0.01)",
              border: "1px solid rgba(255,255,255,0.03)",
              borderRadius: "6px",
              padding: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              transition: "all 0.5s ease"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: getTypeColor(event.type), textTransform: "uppercase", fontSize: "0.625rem" }}>
                {event.type}
              </span>
              <span style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}>{event.timestamp}</span>
            </div>
            
            <p style={{ color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.3 }}>
              {event.message}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", fontSize: "0.625rem", marginTop: "2px", borderTop: "1px solid rgba(255,255,255,0.02)", paddingTop: "4px" }}>
              <a
                href={`https://testnet.arcscan.app/tx/${event.txHash}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontFamily: "monospace", color: "var(--color-text-tertiary)", textDecoration: "none" }}
                className="hover:underline"
              >
                Tx: {event.txHash.slice(0, 8)}...
              </a>
              {event.amount && (
                <strong style={{ color: "var(--color-text-primary)" }}>{event.amount}</strong>
              )}
            </div>

            {event.gasSponsored && (
              <div style={{ fontSize: "0.6rem", color: "var(--color-success)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "2px" }}>
                <BoltIcon size={10} animate /> Gas Sponsored: {event.gasSponsored}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
