"use client";

import { useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DiscoveryEngine } from "@/components/DiscoveryEngine";

interface LogEntry {
  timestamp: string;
  type: "session" | "semantic" | "episodic" | "shared";
  message: string;
}

export function AgentStudioView() {
  const { circleWallet } = useChat();
  
  // States
  const [playgroundPrompt, setPlaygroundPrompt] = useState("");
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundOutput, setPlaygroundOutput] = useState<any>(null);
  const [selectedMemoryType, setSelectedMemoryType] = useState<"session" | "semantic" | "episodic" | "shared">("session");
  const [activeTab, setActiveTab] = useState<"capabilities" | "workflow" | "agents">("capabilities");
  const [ragQuery, setRagQuery] = useState("");
  const [ragResult, setRagResult] = useState<any>(null);
  const [ragLoading, setRagLoading] = useState(false);

  // Stats ticking
  const [throughput, setThroughput] = useState(247);
  const [accruedSponsorship, setAccruedSponsorship] = useState(1.428);

  useEffect(() => {
    const interval = setInterval(() => {
      setThroughput((prev) => prev + (Math.random() > 0.7 ? 1 : 0));
      setAccruedSponsorship((prev) => prev + 0.000025);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Run Playground API
  const handleTestPrompt = async () => {
    if (!playgroundPrompt.trim()) return;
    setPlaygroundLoading(true);
    setPlaygroundOutput(null);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: playgroundPrompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlaygroundOutput(data);
      } else {
        setPlaygroundOutput({ error: `Server returned status: ${res.status}` });
      }
    } catch (err: any) {
      setPlaygroundOutput({ error: err.message || "Failed to process playground prompt" });
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Run RAG Search Simulator
  const handleRagSearch = async () => {
    if (!ragQuery.trim()) return;
    setRagLoading(true);
    setRagResult(null);
    // Simulate real vector db query latency
    setTimeout(() => {
      setRagLoading(false);
      const docs = [
        {
          id: "doc-compliance-301",
          score: 0.94,
          title: "AML Regulation & Compliance Thresholds (Arc Testnet)",
          snippet: "Transactions above 1,000 USDC automatically trigger compliance alert status codes, requiring signature verification."
        },
        {
          id: "doc-nanopay-05",
          score: 0.81,
          title: "Circle Nanopayment Channel Off-chain Settlement",
          snippet: "Ephemeral off-chain payment channels support instant, low-latency micro-payments of $0.0005 per message request."
        }
      ];
      setRagResult(docs.filter(d => d.title.toLowerCase().includes(ragQuery.toLowerCase()) || d.snippet.toLowerCase().includes(ragQuery.toLowerCase())));
    }, 450);
  };

  // Memory simulator logs
  const memoryLogs: LogEntry[] = [
    { timestamp: "08:14:22", type: "session", message: "Initial handshakes established for user PIN session" },
    { timestamp: "08:14:23", type: "session", message: "Assigned ephemeral session ID: NP-902-8X" },
    { timestamp: "08:15:02", type: "semantic", message: "Parsed intent: 'remittance to Bob' matches vector: transfer(toAddress=0x739...)" },
    { timestamp: "08:15:10", type: "episodic", message: "Completed transaction Hash: 0x98f2... successfully sponsored" },
    { timestamp: "08:16:01", type: "shared", message: "Updated checker roster metadata. Sweeping conditions: idle balance > 100 USDC" },
  ];

  return (
    <div className="app-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Navbar>
        <a href="/chat" className="btn btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", fontSize: "11px", fontWeight: "bold", padding: "6px 12px", borderRadius: "8px" }}>
          💬 Chat Interface
        </a>
        <a href="/admin" className="btn btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", fontSize: "11px", fontWeight: "bold", padding: "6px 12px", borderRadius: "8px" }}>
          🏢 Enterprise Admin
        </a>
        <div className="network-badge">
          <span className="network-dot" />
          Active Remittance Agent
        </div>
      </Navbar>

      <div className="w-full max-w-[1200px] mx-auto px-4 mt-6">
        <Breadcrumbs items={[{ label: "Agent Studio Sandbox", url: "/agent-studio" }]} />
      </div>

      {/* Main OS Panel */}
      <main className="app-main" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", padding: "var(--space-4) var(--space-6)", width: "100%", maxWidth: "1200px", margin: "0 auto", flex: 1 }}>
        
        {/* Section 1: Hero Telemetry */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
          <div className="card" style={{ padding: "var(--space-5)", background: "rgba(255, 107, 74, 0.02)", borderColor: "rgba(255, 107, 74, 0.15)" }}>
            <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary)" }}>Agent Identity Registry</span>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "6px 0 12px 0" }}>ERC-8004 Remittance Bot</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Contract address</span>
                <span className="text-mono" style={{ color: "var(--color-text-primary)" }}>0x8183...616f</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>IPFS metadata</span>
                <span className="text-mono" style={{ color: "var(--color-text-primary)" }}>ipfs://QmPv4G...</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Reputation Rating</span>
                <span style={{ color: "var(--color-success)", fontWeight: 700 }}>★ 4.9 (48 votes)</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: "var(--space-5)" }}>
            <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-tertiary)" }}>Agent Sponsor Balance</span>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "6px 0 12px 0", color: "var(--color-text-primary)" }}>
              {circleWallet.balance !== null ? parseFloat(circleWallet.balance).toFixed(4) : "24.5000"} <span style={{ fontSize: "1rem", fontWeight: 400 }}>USDC</span>
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.6875rem", color: "var(--color-success)" }}>
              <span style={{ height: "6px", width: "6px", borderRadius: "50%", background: "var(--color-success)" }} />
              Paymaster sponsorship active on Arc Testnet
            </div>
          </div>

          <div className="card" style={{ padding: "var(--space-5)" }}>
            <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-tertiary)" }}>Observability Telemetry</span>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "6px 0 12px 0" }}>{throughput} <span style={{ fontSize: "1rem", fontWeight: 400, color: "var(--color-text-secondary)" }}>API runs</span></h2>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
              <span>Avg Latency:</span>
              <strong style={{ color: "var(--color-text-primary)" }}>342ms</strong>
            </div>
          </div>
        </section>

        {/* Section 2: Playground & Parser Logs */}
        <section className="grid-responsive-2col">
          
          {/* Left: Interactive Playground */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Agent Console Playground</h3>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                Submit any remittance, yield, or batch payout instruction to inspect the structured intent output.
              </p>
            </div>

            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <input
                type="text"
                value={playgroundPrompt}
                onChange={(e) => setPlaygroundPrompt(e.target.value)}
                placeholder="e.g., Transfer 5 USDC to 0xa2b2... and sweep remaining to USYC"
                style={{
                  flex: 1,
                  background: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  color: "var(--color-text-primary)",
                  fontSize: "0.875rem"
                }}
              />
              <button
                onClick={handleTestPrompt}
                disabled={playgroundLoading || !playgroundPrompt}
                className="btn btn-primary"
                style={{ padding: "0 18px", height: "42px" }}
              >
                {playgroundLoading ? "Running..." : "Run Agent"}
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              <button onClick={() => setPlaygroundPrompt("send 10 USDC to Bob on Sepolia")} className="suggestion-chip" style={{ background: "rgba(255,255,255,0.03)" }}>Bridge 10 USDC</button>
              <button onClick={() => setPlaygroundPrompt("deploy a work escrow contract for Bob, reward 200 USDC")} className="suggestion-chip" style={{ background: "rgba(255,255,255,0.03)" }}>Deploy Work Escrow</button>
              <button onClick={() => setPlaygroundPrompt("accrue USYC yield and lock rate swap of 100 USDC")} className="suggestion-chip" style={{ background: "rgba(255,255,255,0.03)" }}>Yield Accumulator</button>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-tertiary)" }}>Structured Output (JSON)</span>
              <pre
                style={{
                  flex: 1,
                  background: "var(--color-bg-secondary)",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-success)",
                  maxHeight: "220px",
                  overflowY: "auto",
                  whiteSpace: "pre-wrap"
                }}
              >
                {playgroundOutput ? JSON.stringify(playgroundOutput, null, 2) : "// Awaiting console execute..."}
              </pre>
            </div>
          </div>

          {/* Right: Interactive Tabs (Capabilities, Workflow, Agents Visualizer) */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", gap: "var(--space-4)" }}>
              <button
                onClick={() => setActiveTab("capabilities")}
                style={{
                  padding: "10px 0",
                  borderBottom: activeTab === "capabilities" ? "2px solid var(--color-primary)" : "none",
                  background: "none",
                  color: activeTab === "capabilities" ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 700
                }}
              >
                Capabilities
              </button>
              <button
                onClick={() => setActiveTab("workflow")}
                style={{
                  padding: "10px 0",
                  borderBottom: activeTab === "workflow" ? "2px solid var(--color-primary)" : "none",
                  background: "none",
                  color: activeTab === "workflow" ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 700
                }}
              >
                Workflow Builder
              </button>
              <button
                onClick={() => setActiveTab("agents")}
                style={{
                  padding: "10px 0",
                  borderBottom: activeTab === "agents" ? "2px solid var(--color-primary)" : "none",
                  background: "none",
                  color: activeTab === "agents" ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 700
                }}
              >
                Agent Topology
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", maxHeight: "300px" }}>
              {activeTab === "capabilities" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                    <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text-primary)", display: "flex", gap: "6px" }}>🔑 Circle UCW Remittance</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>Gasless EIP-712 Remittance on Arc Chain sponsored by Developer paymaster.</p>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                    <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text-primary)", display: "flex", gap: "6px" }}>🌉 Crosschain CCTP Bridge</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>Burn & mint USDC directly between EVM networks and Arc Chain using App Kit.</p>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                    <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text-primary)", display: "flex", gap: "6px" }}>📈 Treasury Auto-Sweep</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>Sweeping excess corporate balance to USYC yield-bearing vaults.</p>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                    <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text-primary)", display: "flex", gap: "6px" }}>🔒 Escrow & Work Contracts</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>ERC-8183 compliant work escrow for instant multi-party contractor authorization.</p>
                  </div>
                </div>
              )}

              {activeTab === "workflow" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--color-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", textAlign: "center" }}>1</div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-border)" }}>
                      <strong>Intent Parser Node</strong>: LLM processes input & recovers EIP-191 signatures.
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--color-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", textAlign: "center" }}>2</div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-border)" }}>
                      <strong>Compliance Scoping</strong>: Runs dynamic AML scores & rules before execution.
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--color-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", textAlign: "center" }}>3</div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--color-border)" }}>
                      <strong>EIP-7708 Sponsorship Engine</strong>: Bypasses user gas by calling paymaster bundle APIs.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "agents" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "6px" }}>
                    <span>Active Agents</span>
                    <span>Role</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                    <strong>👑 Master Agent</strong>
                    <span style={{ color: "var(--color-text-secondary)" }}>Intent Router</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                    <strong>🧠 Planner Agent</strong>
                    <span style={{ color: "var(--color-text-secondary)" }}>Step compiler</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                    <strong>🛡️ Compliance Sentinel</strong>
                    <span style={{ color: "var(--color-text-secondary)" }}>AML Evaluator</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Tool Registry & Memory Explorer */}
        <section className="grid-responsive-2col">
          
          {/* Left: Tool Registry */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Programmatic Tool Registry</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.75rem" }}>
                <span>Circle UCW SDK</span>
                <code style={{ color: "var(--color-primary)" }}>@circle-fin/user-controlled-wallets</code>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.75rem" }}>
                <span>Circle App Kit CCTP</span>
                <code style={{ color: "var(--color-primary)" }}>@circle-fin/app-kit</code>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.75rem" }}>
                <span>Gasless Bundler</span>
                <code style={{ color: "var(--color-primary)" }}>/api/paymaster/sponsor</code>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.75rem" }}>
                <span>Compliance Watch</span>
                <code style={{ color: "var(--color-primary)" }}>/api/compliance/check</code>
              </div>
            </div>
          </div>

          {/* Right: Memory Explorer */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Real-Time Memory Explorer</h3>
              <div style={{ display: "flex", gap: "4px" }}>
                {(["session", "semantic", "episodic", "shared"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMemoryType(m)}
                    className="suggestion-chip"
                    style={{
                      padding: "4px 8px",
                      fontSize: "0.6875rem",
                      background: selectedMemoryType === m ? "var(--color-primary)" : "rgba(255,255,255,0.03)",
                      color: selectedMemoryType === m ? "white" : "var(--color-text-secondary)"
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "12px",
                maxHeight: "180px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              {memoryLogs
                .filter((log) => log.type === selectedMemoryType)
                .map((log, idx) => (
                  <div key={idx} style={{ fontSize: "0.75rem", display: "flex", gap: "10px" }}>
                    <span className="text-mono" style={{ color: "var(--color-text-tertiary)" }}>[{log.timestamp}]</span>
                    <span style={{ color: "var(--color-text-primary)" }}>{log.message}</span>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Section 4: Knowledge Center (RAG) & Enterprise Security */}
        <section className="grid-responsive-2col">
          
          {/* Left: Knowledge Center */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Vector Knowledge Center (RAG)</h3>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <input
                type="text"
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                placeholder="Query vector db (e.g. compliance, nanopay)"
                style={{
                  flex: 1,
                  background: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 12px",
                  color: "var(--color-text-primary)",
                  fontSize: "0.75rem"
                }}
              />
              <button
                onClick={handleRagSearch}
                disabled={ragLoading || !ragQuery}
                className="btn btn-secondary"
                style={{ padding: "0 14px", height: "36px", fontSize: "0.75rem" }}
              >
                {ragLoading ? "Searching..." : "Vector Query"}
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", maxHeight: "150px" }}>
              {ragResult ? (
                ragResult.length > 0 ? (
                  ragResult.map((doc: any, idx: number) => (
                    <div key={idx} style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.75rem", marginBottom: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <strong style={{ color: "var(--color-text-primary)" }}>{doc.title}</strong>
                        <span style={{ color: "var(--color-success)", fontWeight: 700 }}>{(doc.score * 100).toFixed(0)}% Match</span>
                      </div>
                      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.7rem", lineHeight: 1.4 }}>{doc.snippet}</p>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>No vector hits. Try querying "compliance" or "nanopay"</span>
                )
              ) : (
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>Awaiting vector search input...</span>
              )}
            </div>
          </div>

          {/* Right: Security & Observability Settings */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Enterprise Security Engine</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Prompt Injection Guard</span>
                <span style={{ color: "var(--color-success)", fontWeight: 700 }}>✓ ACTIVE</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Dynamic Compliance Score Cap</span>
                <span style={{ color: "var(--color-warning)", fontWeight: 700 }}>Risk Threshold 8.5</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Signature verification (EIP-191)</span>
                <span style={{ color: "var(--color-success)", fontWeight: 700 }}>✓ ENFORCED</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: API Access & Developer Docs */}
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Programmatic API Access & Documentation</h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
            Integrate the WireStable agent orchestrator into your own applications using raw HTTP protocols.
          </p>

          <div style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", padding: "16px" }}>
            <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>POST Remittance Request</span>
            <pre style={{ color: "var(--color-primary)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", marginTop: "6px", whiteSpace: "pre-wrap" }}>
{`curl -X POST https://wirestable.io/api/parse \\
  -H "Content-Type: application/json" \\
  -H "x402-payment-token: <EIP-191-Nanopayment-Attestation>" \\
  -d '{"message": "Remit 100 USDC to 0xa2b2..."}'`}
            </pre>
          </div>

          <div style={{ display: "flex", gap: "var(--space-4)", fontSize: "0.75rem", marginTop: "var(--space-2)" }}>
            <a href="https://developers.circle.com/" target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>Circle Developer Portal</a>
            <a href="https://arc.network/docs" target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>Arc Network Docs</a>
            <a href="https://github.com/circlefi" target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>Circle GitHub Repositories</a>
          </div>
        </section>

        <DiscoveryEngine category="developer" currentPath="/agent-studio" />
      </main>
    </div>
  );
}
