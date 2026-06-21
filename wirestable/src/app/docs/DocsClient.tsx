"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedContent } from "@/components/RelatedContent";
import { CTASection } from "@/components/CTASection";

export default function DocsPage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const codeSnippets = {
    setup: `npm install @circle-fin/user-controlled-wallets @circle-fin/app-kit viem`,
    payout: `const res = await fetch("/api/corporate/payouts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    payouts: [
      { name: "Alice", address: "0x739...", amount: 250 },
      { name: "Bob", address: "0x98f...", amount: 150 }
    ],
    token: "USDC"
  })
});`,
    nanopay: `// Open off-chain nanopayment channel
const res = await fetch("/api/nanopay/channel", {
  method: "POST",
  body: JSON.stringify({ initialDeposit: "10", clientAddress: "0x..." })
});`
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Navbar>
        <a href="/" className="btn btn-secondary btn-sm" style={{ textDecoration: "none", fontSize: "11px", fontWeight: "bold" }}>
          🏠 Landing Page
        </a>
        <a href="/chat" className="btn btn-primary btn-sm" style={{ textDecoration: "none", fontSize: "11px", fontWeight: "bold" }}>
          Launch App ⚡
        </a>
      </Navbar>

      {/* Visual Breadcrumb navigation */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "var(--space-6) var(--space-4) 0 var(--space-4)" }}>
        <Breadcrumbs />
      </div>

      {/* Docs Layout */}
      <main className="app-main grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 w-full max-w-[1200px] mx-auto px-4 py-6" style={{ flex: 1, paddingBottom: "100px" }}>
        
        {/* Sidebar Nav */}
        <aside className="flex flex-col gap-4 md:sticky md:top-[100px] md:h-fit">
          <div>
            <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-primary)", letterSpacing: "0.05em", marginBottom: "8px" }}>Getting Started</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.875rem", padding: 0 }}>
              <li><a href="#intro" style={{ color: "var(--color-text-primary)", textDecoration: "none" }}>Introduction</a></li>
              <li><a href="#quickstart" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Quick Start</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-tertiary)", letterSpacing: "0.05em", marginBottom: "8px" }}>Core Concepts</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.875rem", padding: 0 }}>
              <li><a href="#ucw" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Circle Smart Wallets</a></li>
              <li><a href="#paymaster" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Gas Sponsorship</a></li>
              <li><a href="#nanopay" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Nanopayment Channels</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-tertiary)", letterSpacing: "0.05em", marginBottom: "8px" }}>API Reference</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.875rem", padding: 0 }}>
              <li><a href="#api-payout" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Payout API</a></li>
              <li><a href="#api-nanopay" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Settle Channel API</a></li>
            </ul>
          </div>
        </aside>

        {/* Content Area */}
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          
          {/* Introduction */}
          <div id="intro" className="card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-primary)" }}>Introduction</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "12px", lineHeight: 1.6 }}>
              WireStable is a next-generation AI-First stablecoin remittance stack. It integrates **Circle User-Controlled Smart Wallets** and **Arc Network’s** native USDC gas engine to power fluid, natural-language-driven global money routing.
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "12px", lineHeight: 1.6 }}>
              By merging modern AI intent parsing with on-chain EIP-7708 gas sponsorship, WireStable removes typical Web3 complexities (handling private keys, buying native gas tokens, setting custom slippage) for corporate treasuries and everyday consumers.
            </p>
          </div>

          {/* Quick Start */}
          <div id="quickstart" className="card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-primary)" }}>Quick Start</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px" }}>
              Install dependencies to start integrating Circle Programmable Wallets in your own project:
            </p>
            
            <div style={{ position: "relative", marginTop: "12px" }}>
              <pre style={{ background: "var(--color-bg-secondary)", padding: "14px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", color: "var(--color-primary)", overflowX: "auto" }}>
                {codeSnippets.setup}
              </pre>
              <button 
                onClick={() => handleCopy(codeSnippets.setup, "setup")} 
                style={{ position: "absolute", top: "10px", right: "10px", padding: "4px 8px", fontSize: "0.6875rem", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)", cursor: "pointer" }}
              >
                {copiedText === "setup" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Circle Smart Wallets */}
          <div id="ucw" className="card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-primary)" }}>Circle Smart Wallets (SCA)</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.6 }}>
              We leverage Circle’s non-custodial Smart Contract Account (SCA) architecture. When users onboard via email, their private keys remain secure in hardware enclaves, while cryptographic challenges allow permissionless remittance execution.
            </p>
          </div>

          {/* Gas Sponsorship */}
          <div id="paymaster" className="card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-primary)" }}>EIP-7708 Paymaster Gas Sponsorship</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.6 }}>
              All transactions executed on the Arc Chain bypass user gas requirements. A backend developer-controlled sponsorship paymaster automatically catches transaction hashes and funds fees in USDC gas directly on-chain, creating a true gasless experience.
            </p>
          </div>

          {/* API references */}
          <div id="api-payout" className="card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text-primary)" }}>Treasury Payout API</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px" }}>
              Submit payroll payout rows to create a Maker-Checker pending batch flow:
            </p>

            <div style={{ position: "relative", marginTop: "12px" }}>
              <pre style={{ background: "var(--color-bg-secondary)", padding: "14px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", color: "var(--color-primary)", overflowX: "auto" }}>
                {codeSnippets.payout}
              </pre>
              <button 
                onClick={() => handleCopy(codeSnippets.payout, "payout")} 
                style={{ position: "absolute", top: "10px", right: "10px", padding: "4px 8px", fontSize: "0.6875rem", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)", cursor: "pointer" }}
              >
                {copiedText === "payout" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Contextual navigation & CTAs */}
          <RelatedContent />
          <CTASection />

        </section>
      </main>
    </div>
  );
}

