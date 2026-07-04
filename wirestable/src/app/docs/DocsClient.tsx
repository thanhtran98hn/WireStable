"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedContent } from "@/components/RelatedContent";
import { CTASection } from "@/components/CTASection";
import { 
  HomeIcon, 
  BoltIcon, 
  LockIcon, 
  ShieldIcon, 
  SyncIcon, 
  SearchIcon, 
  BuildingIcon, 
  WarningIcon, 
  CheckIcon, 
  HelpIcon,
  WireStableLogo
} from "@/components/icons/CustomIcons";

type CodeLang = "ts" | "py" | "curl";

export default function DocsPage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CodeLang>("ts");

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const codeSnippets = {
    setup: {
      ts: `npm install @circle-fin/user-controlled-wallets @circle-fin/app-kit viem`,
      py: `pip install circle-developer-sdk viem-py`,
      curl: `# Install Circle developer tools cli
curl -sSL https://raw.githubusercontent.com/circlefin/developer-cli/main/install.sh | sh`
    },
    payout: {
      ts: `import { CircleDeveloperControlledWallets } from "@circle-fin/developer-controlled-wallets";

const client = new CircleDeveloperControlledWallets({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.ENTITY_SECRET
});

const response = await client.createTransaction({
  walletId: "0x8922c1...",
  destinationAddress: "0x742d3...",
  amount: ["250.00"],
  feeLevel: "LOW", // Gasless sponsored via Paymaster
  tokenId: "USDC"
});`,
      py: `from circle_developer_wallets import CircleDeveloperControlledWallets

client = CircleDeveloperControlledWallets(
    api_key="CIRCLE_API_KEY",
    entity_secret="ENTITY_SECRET"
)

response = client.create_transaction(
    wallet_id="0x8922c1...",
    destination_address="0x742d3...",
    amount=["250.00"],
    fee_level="LOW",
    token_id="USDC"
)`,
      curl: `curl -X POST https://api.circle.com/v1/w3s/developer/transactions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "walletId": "0x8922c1...",
    "destinationAddress": "0x742d3...",
    "amounts": ["250.00"],
    "tokenId": "USDC",
    "feeLevel": "LOW"
  }'`
    },
    lock: {
      ts: `// Request 24h FX Option Rate Lock on Arc Chain
const response = await fetch("https://wirestable.xyz/api/fx-hedging/quote", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    amount: 10000,
    corridor: "USDC-EURC",
    targetRate: 0.9245
  })
});

const { lockId, premium } = await response.json();
console.log(\`Rate lock secured. ID: #\${lockId}, Premium: \${premium} USDC\`);`,
      py: `import requests

# Request 24h FX Option Rate Lock on Arc Chain
response = requests.post(
    "https://wirestable.xyz/api/fx-hedging/quote",
    json={
        "amount": 10000,
        "corridor": "USDC-EURC",
        "targetRate": 0.9245
    }
)

data = response.json()
print(f"Rate lock secured. ID: #{data['lockId']}, Premium: {data['premium']} USDC")`,
      curl: `curl -X POST https://wirestable.xyz/api/fx-hedging/quote \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 10000,
    "corridor": "USDC-EURC",
    "targetRate": 0.9245
  }'`
    },
    nanopay: {
      ts: `// Initialize streaming remittance channel
const res = await fetch("https://wirestable.xyz/api/nanopay/channel", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    initialDeposit: "500.00",
    recipientAddress: "0x98f3c...",
    flowRatePerSecond: "0.00578" // ~20.8 USDC/hour
  })
});`,
      py: `import requests

# Initialize streaming remittance channel
res = requests.post(
    "https://wirestable.xyz/api/nanopay/channel",
    json={
        "initialDeposit": "500.00",
        "recipientAddress": "0x98f3c...",
        "flowRatePerSecond": "0.00578"
    }
)`,
      curl: `curl -X POST https://wirestable.xyz/api/nanopay/channel \\
  -H "Content-Type: application/json" \\
  -d '{
    "initialDeposit": "500.00",
    "recipientAddress": "0x98f3c...",
    "flowRatePerSecond": "0.00578"
  }'`
    }
  };

  return (
    <div className="app-container" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <Navbar>
        <a href="/" className="btn btn-secondary btn-sm" style={{ textDecoration: "none", fontSize: "11px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
          <HomeIcon size={12} /> Landing Page
        </a>
        <a href="/chat" className="btn btn-primary btn-sm" style={{ textDecoration: "none", fontSize: "11px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
          Launch App <BoltIcon size={12} />
        </a>
      </Navbar>

      {/* Visual Breadcrumb navigation */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "var(--space-6) var(--space-4) 0 var(--space-4)" }}>
        <Breadcrumbs />
      </div>

      {/* Docs Layout */}
      <main className="docs-layout" style={{ flex: 1, paddingBottom: "100px" }}>
        
        {/* Sidebar Nav */}
        <aside className="flex flex-col gap-6 md:sticky md:top-[100px] md:h-fit" style={{ borderRight: "1px solid var(--color-border)", paddingRight: "20px" }}>
          <div>
            <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-primary)", letterSpacing: "0.05em", marginBottom: "8px", fontWeight: 700 }}>Getting Started</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.875rem", padding: 0 }}>
              <li><a href="#intro" style={{ color: "var(--color-text-primary)", textDecoration: "none", fontWeight: 600 }}>Introduction</a></li>
              <li><a href="#quickstart" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Quick Start</a></li>
              <li><a href="#architecture" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>System Architecture</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-tertiary)", letterSpacing: "0.05em", marginBottom: "8px", fontWeight: 700 }}>Core Infrastructure</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.875rem", padding: 0 }}>
              <li><a href="#ucw" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Circle Smart Accounts</a></li>
              <li><a href="#paymaster" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>EIP-7708 Gasless Paymaster</a></li>
              <li><a href="#gateway" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Unified Portfolio Routing</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-tertiary)", letterSpacing: "0.05em", marginBottom: "8px", fontWeight: 700 }}>DeFi & Treasury</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.875rem", padding: 0 }}>
              <li><a href="#hedging" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>FX Option Rate Locks</a></li>
              <li><a href="#sweeps" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Automated Yield Sweeps</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-tertiary)", letterSpacing: "0.05em", marginBottom: "8px", fontWeight: 700 }}>API Reference</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.875rem", padding: 0 }}>
              <li><a href="#api-payout" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Payout API</a></li>
              <li><a href="#api-lock" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>FX Hedging API</a></li>
              <li><a href="#api-nanopay" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Streaming Channels API</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-tertiary)", letterSpacing: "0.05em", marginBottom: "8px", fontWeight: 700 }}>Troubleshooting</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.875rem", padding: 0 }}>
              <li><a href="#errors" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Error Explanations</a></li>
              <li><a href="#faq" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Developer FAQ</a></li>
            </ul>
          </div>
        </aside>

        {/* Content Area */}
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          
          {/* Introduction */}
          <div id="intro" className="card" style={{ padding: "var(--space-5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <div style={{ background: "var(--color-primary)", borderRadius: "50%", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <WireStableLogo size={24} className="text-white" />
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>Introduction</h2>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "12px", lineHeight: 1.6 }}>
              WireStable is a production-grade, conversational Web3 stablecoin stack that simplifies remittances and active treasury operations. By leveraging **Circle User-Controlled Smart Wallets** and the **Arc Network's** USDC gas token abstraction, WireStable makes corporate payouts, volatility hedging, and salary streams frictionless.
            </p>
            <div style={{ marginTop: "16px", padding: "12px 16px", borderLeft: "4px solid var(--color-primary)", background: "var(--color-bg-secondary)", borderRadius: "0 8px 8px 0" }}>
              <strong style={{ fontSize: "0.8125rem", color: "var(--color-primary)", display: "block" }}>Key Highlight: Gasless Stablecoin Flow</strong>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", margin: "4px 0 0 0" }}>
                Unlike legacy Web3 apps, users never need to hold ETH or other native L1 gas tokens. Transactions are fully sponsored on the Arc Chain in USDC gas via EIP-7708, minimizing time-to-first-success.
              </p>
            </div>
          </div>

          {/* Quick Start with Language Switcher */}
          <div id="quickstart" className="card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "8px" }}>Quick Start</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
              WireStable integrates seamlessly with standard JavaScript/TypeScript ecosystems, Python backend clients, and standard shell endpoints. Use the language switcher below to inspect setup instructions:
            </p>
            
            {/* Lang Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", marginBottom: "12px", gap: "12px" }}>
              {(["ts", "py", "curl"] as CodeLang[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveTab(lang)}
                  style={{
                    padding: "8px 16px",
                    background: "none",
                    border: "none",
                    borderBottom: activeTab === lang ? "2px solid var(--color-primary)" : "2px solid transparent",
                    color: activeTab === lang ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  {lang === "ts" ? "TypeScript SDK" : lang === "py" ? "Python SDK" : "cURL CLI"}
                </button>
              ))}
            </div>

            <div style={{ position: "relative" }}>
              <pre style={{ background: "var(--color-bg-secondary)", padding: "16px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", overflowX: "auto" }}>
                {codeSnippets.setup[activeTab]}
              </pre>
              <button 
                onClick={() => handleCopy(codeSnippets.setup[activeTab], "setup")} 
                style={{ position: "absolute", top: "10px", right: "10px", padding: "4px 8px", fontSize: "0.6875rem", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)", cursor: "pointer" }}
              >
                {copiedText === "setup" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* System Architecture Section */}
          <div id="architecture" className="card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
              <BuildingIcon size={20} className="text-[var(--color-primary)]" /> System Architecture
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.6 }}>
              The diagram below visualizes the end-to-end request pipeline, showing how conversational user intent is processed, verified, and settled.
            </p>

            {/* Architecture SVG diagram */}
            <div style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "center", marginTop: "16px", overflowX: "auto" }}>
              <svg width="600" height="200" viewBox="0 0 600 200" fill="none" style={{ minWidth: "500px" }}>
                {/* Node 1 */}
                <rect x="10" y="70" width="110" height="60" rx="8" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
                <text x="65" y="100" fill="var(--color-text-primary)" fontSize="10" fontWeight="bold" textAnchor="middle">User Intent</text>
                <text x="65" y="115" fill="var(--color-text-tertiary)" fontSize="8" textAnchor="middle">"Send $250 to..."</text>

                {/* Arrow 1 */}
                <line x1="120" y1="100" x2="155" y2="100" stroke="var(--color-primary)" strokeWidth="1.5" markerEnd="url(#arrow)" />
                
                {/* Node 2 */}
                <rect x="160" y="70" width="110" height="60" rx="8" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
                <text x="215" y="95" fill="var(--color-text-primary)" fontSize="10" fontWeight="bold" textAnchor="middle">Agent OS Engine</text>
                <text x="215" y="110" fill="var(--color-text-secondary)" fontSize="8" textAnchor="middle">Compliance Audit</text>
                <text x="215" y="122" fill="var(--color-success)" fontSize="7" textAnchor="middle">Score Checked ✓</text>

                {/* Arrow 2 */}
                <line x1="270" y1="100" x2="305" y2="100" stroke="var(--color-primary)" strokeWidth="1.5" />

                {/* Node 3 */}
                <rect x="310" y="70" width="120" height="60" rx="8" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
                <text x="370" y="95" fill="var(--color-text-primary)" fontSize="10" fontWeight="bold" textAnchor="middle">Circle API & SCA</text>
                <text x="370" y="110" fill="var(--color-text-secondary)" fontSize="8" textAnchor="middle">EIP-712 Challenge</text>
                <text x="370" y="122" fill="var(--color-accent)" fontSize="8" textAnchor="middle">Hardware Secure</text>

                {/* Arrow 3 */}
                <line x1="430" y1="100" x2="465" y2="100" stroke="var(--color-primary)" strokeWidth="1.5" />

                {/* Node 4 */}
                <rect x="470" y="70" width="110" height="60" rx="8" fill="rgba(255,107,74,0.1)" stroke="var(--color-primary)" strokeWidth="1.5" />
                <text x="525" y="95" fill="var(--color-primary)" fontSize="10" fontWeight="bold" textAnchor="middle">Arc Gas Settled</text>
                <text x="525" y="110" fill="var(--color-text-secondary)" fontSize="8" textAnchor="middle">Sponsored Paymaster</text>
                <text x="525" y="122" fill="var(--color-success)" fontSize="8" textAnchor="middle">&lt; 350ms Finality</text>

                {/* Marker definition */}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-primary)" />
                  </marker>
                </defs>
              </svg>
            </div>
          </div>

          {/* Circle Smart Accounts */}
          <div id="ucw" className="card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
              <LockIcon size={20} className="text-[var(--color-primary)]" /> Circle User-Controlled Smart Wallets
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.6 }}>
              User funds are secured via Circle's non-custodial Smart Contract Account (SCA) SDK. During onboarding, a user creates cryptographic keys secured in their device's hardware enclave (WebAuthn/Passkey). Transfers require the client to execute a challenge, ensuring that neither the platform nor the AI agent can ever touch funds without permission.
            </p>
          </div>

          {/* EIP-7708 Paymaster */}
          <div id="paymaster" className="card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldIcon size={20} className="text-[var(--color-primary)]" /> EIP-7708 Gasless Paymaster
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.6 }}>
              WireStable maps transaction payloads to an off-chain Paymaster. When the Smart Account proposes a transaction execution, the Paymaster automatically funds the gas fee in USDC on the Arc Chain. The end-user is completely isolated from needing L1 gas tokens.
            </p>
          </div>

          {/* Unified Portfolio Routing */}
          <div id="gateway" className="card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
              <SyncIcon size={20} className="text-[var(--color-primary)]" /> Unified Cross-Chain Portfolio
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.6 }}>
              Through **Circle Gateway APIs**, WireStable aggregates a unified USDC portfolio balance across Ethereum Sepolia, Base, and Solana Devnet. The system manages Gateway minters under the hood to consolidate cross-chain deposits and settle payouts instantly.
            </p>
          </div>

          {/* FX Option Rate Locks */}
          <div id="hedging" className="card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
              <LockIcon size={20} className="text-[var(--color-primary)]" /> Volatility Hedging (ERC-8004 Locks)
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.6 }}>
              Corporations can hedge exchange volatility during remittance corridors. The system deploys cryptographic ERC-8004 FX rate locks on the Arc Chain for 24 hours, securing a fixed exchange rate (e.g. USDC to EURC) for a micro-premium.
            </p>
            
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "16px", marginBottom: "8px" }}>Integration Example</h4>
            <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", marginBottom: "12px", gap: "12px" }}>
              {(["ts", "py", "curl"] as CodeLang[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveTab(lang)}
                  style={{
                    padding: "6px 12px",
                    background: "none",
                    border: "none",
                    borderBottom: activeTab === lang ? "2px solid var(--color-primary)" : "2px solid transparent",
                    color: activeTab === lang ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
                    fontSize: "0.75rem",
                    cursor: "pointer"
                  }}
                >
                  {lang === "ts" ? "TypeScript" : lang === "py" ? "Python" : "cURL"}
                </button>
              ))}
            </div>

            <div style={{ position: "relative" }}>
              <pre style={{ background: "var(--color-bg-secondary)", padding: "16px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", overflowX: "auto" }}>
                {codeSnippets.lock[activeTab]}
              </pre>
              <button 
                onClick={() => handleCopy(codeSnippets.lock[activeTab], "lock")} 
                style={{ position: "absolute", top: "10px", right: "10px", padding: "4px 8px", fontSize: "0.6875rem", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)", cursor: "pointer" }}
              >
                {copiedText === "lock" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* API References */}
          <div id="api-payout" className="card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "8px" }}>Payout API Reference</h2>
            <span style={{ display: "inline-block", background: "var(--color-success-bg)", color: "var(--color-success)", fontSize: "0.6875rem", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase", marginBottom: "12px" }}>
              POST /api/corporate/payouts
            </span>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
              Initializes a batch transaction payroll payout. Returns transaction signatures and verification records.
            </p>

            <div style={{ position: "relative" }}>
              <pre style={{ background: "var(--color-bg-secondary)", padding: "16px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", overflowX: "auto" }}>
                {codeSnippets.payout[activeTab]}
              </pre>
              <button 
                onClick={() => handleCopy(codeSnippets.payout[activeTab], "payout")} 
                style={{ position: "absolute", top: "10px", right: "10px", padding: "4px 8px", fontSize: "0.6875rem", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)", cursor: "pointer" }}
              >
                {copiedText === "payout" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Streaming Channels API */}
          <div id="api-nanopay" className="card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "8px" }}>Nanopayment Stream API Reference</h2>
            <span style={{ display: "inline-block", background: "var(--color-success-bg)", color: "var(--color-success)", fontSize: "0.6875rem", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase", marginBottom: "12px" }}>
              POST /api/nanopay/channel
            </span>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
              Deploys an off-chain micro-payment streaming channel, establishing continuous salary flows that accumulate per second.
            </p>

            <div style={{ position: "relative" }}>
              <pre style={{ background: "var(--color-bg-secondary)", padding: "16px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", overflowX: "auto" }}>
                {codeSnippets.nanopay[activeTab]}
              </pre>
              <button 
                onClick={() => handleCopy(codeSnippets.nanopay[activeTab], "nanopay")} 
                style={{ position: "absolute", top: "10px", right: "10px", padding: "4px 8px", fontSize: "0.6875rem", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)", cursor: "pointer" }}
              >
                {copiedText === "nanopay" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Error Dictionary */}
          <div id="errors" className="card" style={{ padding: "var(--space-5)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
              <WarningIcon size={20} className="text-[var(--color-error)]" /> Error Code Dictionary
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.6 }}>
              WireStable maps raw chain and Circle SDK errors to clear explanations. Below are the most common error codes encountered during integration:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px", marginTop: "16px" }}>
              <div style={{ border: "1px solid var(--color-border)", padding: "14px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.02)" }}>
                <strong style={{ color: "var(--color-error)", fontSize: "0.875rem" }}>Error 155104: Rate Lock Expiration</strong>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", margin: "4px 0 0 0" }}>
                  <strong>Cause:</strong> Attempting to settle a transaction using a cryptographic option rate lock that has exceeded its 24-hour expiration threshold.<br />
                  <strong>Fix:</strong> Call the `/api/fx-hedging/quote` endpoint to request a fresh rate lock quote and re-approve.
                </p>
              </div>
              <div style={{ border: "1px solid var(--color-border)", padding: "14px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.02)" }}>
                <strong style={{ color: "var(--color-warning)", fontSize: "0.875rem" }}>Error 155109: Gateway Attestation Timeout</strong>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", margin: "4px 0 0 0" }}>
                  <strong>Cause:</strong> The cross-chain minter spent more than 60 seconds waiting for validation blocks on the source chain.<br />
                  <strong>Fix:</strong> Retry operations or verify chain activity on the gateway status dashboard.
                </p>
              </div>
              <div style={{ border: "1px solid var(--color-border)", padding: "14px", borderRadius: "8px", background: "rgba(6, 182, 212, 0.02)" }}>
                <strong style={{ color: "var(--color-info)", fontSize: "0.875rem" }}>Error 155201: Compliance Screening Lock</strong>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", margin: "4px 0 0 0" }}>
                  <strong>Cause:</strong> The compliance screening oracle returned a score below 75 (sanction list or high-risk activity detected).<br />
                  <strong>Fix:</strong> Review the address history or export a SAR PDF report from the admin dashboard to proceed with verification.
                </p>
              </div>
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

