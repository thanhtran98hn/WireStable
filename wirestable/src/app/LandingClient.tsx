"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { 
  BoltIcon, 
  BrainIcon, 
  ShieldIcon, 
  SyncIcon, 
  LockIcon, 
  CheckIcon, 
  CloseIcon, 
  DocsIcon, 
  HelpIcon, 
  BuildingIcon, 
  LinkIcon, 
  TrendUpIcon, 
  HourglassIcon,
  GithubIcon,
  TwitterIcon,
  WireStableLogo
} from "@/components/icons/CustomIcons";

// Code Snippets for DX Section
const CODE_SNIPPETS = {
  ts: `import { CircleDeveloperControlledWallets } from "@circle-fin/developer-controlled-wallets";

const client = new CircleDeveloperControlledWallets({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.ENTITY_SECRET
});

// Execute gasless payouts sponsored via Paymaster
const payout = await client.createTransaction({
  walletId: "0x8922c1...",
  destinationAddress: "0x742d3...",
  amount: ["250.00"],
  tokenId: "USDC",
  feeLevel: "LOW" // Sponsored by WireStable Paymaster
});`,
  py: `from circle_developer_wallets import CircleDeveloperControlledWallets

client = CircleDeveloperControlledWallets(
    api_key="CIRCLE_API_KEY",
    entity_secret="ENTITY_SECRET"
)

# Execute gasless payouts sponsored via Paymaster
payout = client.create_transaction(
    wallet_id="0x8922c1...",
    destination_address="0x742d3...",
    amount=["250.00"],
    token_id="USDC",
    fee_level="LOW"
)`,
  curl: `curl -X POST https://wirestable.xyz/api/corporate/payouts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "walletId": "0x8922c1...",
    "destinationAddress": "0x742d3...",
    "amounts": ["250.00"],
    "tokenId": "USDC",
    "feeLevel": "LOW"
  }'`
};

interface DemoStep {
  label: string;
  detail: string;
  status: "pending" | "running" | "success";
}

interface DemoScenario {
  title: string;
  prompt: string;
  description: string;
  steps: DemoStep[];
  successDetail: {
    amount: string;
    corridor?: string;
    recipient: string;
    rate?: string;
    gasSaved: string;
    txHash: string;
  };
}

export default function LandingPage() {
  // Parallax background offset
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Developer Experience Code Switcher
  const [activeCodeTab, setActiveCodeTab] = useState<"ts" | "py" | "curl">("ts");

  // Live Product Workflow Monitoring State
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number>(0);
  const [demoPromptText, setDemoPromptText] = useState<string>("");
  const [demoStatus, setDemoStatus] = useState<"idle" | "typing" | "running" | "success">("idle");
  const [demoSteps, setDemoSteps] = useState<DemoStep[]>([]);
  const [demoActiveStepIndex, setDemoActiveStepIndex] = useState<number>(-1);

  const demoScenarios: DemoScenario[] = [
    {
      title: "Cross-Border Payout",
      prompt: "Pay $250.00 USDC to Alice in Berlin and swap remaining treasury to EURC.",
      description: "Automate payouts across currencies using instant on-chain settlement.",
      steps: [
        { label: "Secure Authentication", detail: "Resolving Circle smart wallet 0x8922...3b1d via WebAuthn", status: "pending" },
        { label: "Compliance Screening", detail: "Checking recipient Alice against compliance filters", status: "pending" },
        { label: "FX Spot Hedging", detail: "Securing stablecoin corridor rate of 0.9245 EURC/USDC", status: "pending" },
        { label: "Gas Sponsorship & Settlement", detail: "Deploying payload via Arc EIP-7708 Paymaster", status: "pending" }
      ],
      successDetail: {
        amount: "$250.00 USDC (Slipped to 231.12 EURC)",
        recipient: "Alice (0x742d...d389)",
        rate: "1 USDC = 0.9245 EURC",
        gasSaved: "$14.80 USDC (100% Sponsored)",
        txHash: "0x8fae...391b"
      }
    },
    {
      title: "FX Option Rate Lock",
      prompt: "Lock USDC-EURC rate for $10,000 corporate payroll corridor.",
      description: "Secure stable exchange rates to protect corporate corridors from volatility.",
      steps: [
        { label: "Wallet Connection", detail: "Accessing treasury wallet 0x77ae...21ca", status: "pending" },
        { label: "Corridor Analysis", detail: "Evaluating historical volatility and option pricing factors", status: "pending" },
        { label: "Lock Contract Issuance", detail: "Deploying ERC-8004 cryptographic rate lock (Premium: 1.50 USDC)", status: "pending" },
        { label: "On-Chain Registration", detail: "Registering 24h locked corridor rate: 0.9265 EURC/USDC on Arc Chain", status: "pending" }
      ],
      successDetail: {
        amount: "$10,000.00 USDC Locked Corridor",
        recipient: "Treasury Pool (0x77ae...21ca)",
        rate: "1 USDC = 0.9265 EURC (Saves up to 1.8% FX Slippage)",
        gasSaved: "$21.50 USDC (100% Sponsored)",
        txHash: "0x391f...f77c"
      }
    },
    {
      title: "USDC Treasury Sweep",
      prompt: "Auto-sweep 85% of idle corporate USDC balance into yield token.",
      description: "Automatically routing surplus capital to compound in yield-bearing assets.",
      steps: [
        { label: "Threshold Monitoring", detail: "Scanning current account balance... Found $14,200.00 idle USDC", status: "pending" },
        { label: "Sweep Calculations", detail: "Computing target sweep delta: $12,070.00 USDC above reserve", status: "pending" },
        { label: "Vault Transaction Mint", detail: "Invoking deposit to yield-bearing token (USYC)", status: "pending" },
        { label: "Yield Activation", detail: "Broadcasting sponsored sweep. Yield active at 5.15% APY compounding", status: "pending" }
      ],
      successDetail: {
        amount: "$12,070.00 USDC Swept",
        recipient: "DeFi Yield Vault (0x59b1...ad92)",
        rate: "APY 5.15% Compounding",
        gasSaved: "$9.40 USDC (100% Sponsored)",
        txHash: "0x77cd...e2ad"
      }
    }
  ];

  // Typing effect and state machine trigger
  const runWorkflowMonitor = (index: number) => {
    if (demoStatus === "typing" || demoStatus === "running") return;

    setSelectedDemoIndex(index);
    setDemoPromptText("");
    setDemoStatus("typing");
    setDemoActiveStepIndex(-1);
    
    // Copy steps
    const initialSteps = demoScenarios[index].steps.map(s => ({ ...s, status: "pending" as const }));
    setDemoSteps(initialSteps);

    const fullPromptText = demoScenarios[index].prompt;
    let charIndex = 0;
    
    // Typing feedback logic
    const typeInterval = setInterval(() => {
      const char = fullPromptText.charAt(charIndex);
      setDemoPromptText((prev) => prev + char);
      charIndex++;
      if (charIndex >= fullPromptText.length) {
        clearInterval(typeInterval);
        
        // Wait then start running
        setTimeout(() => {
          setDemoStatus("running");
          setDemoActiveStepIndex(0);
        }, 600);
      }
    }, 25);
  };

  // Run execution steps sequentially
  useEffect(() => {
    if (demoStatus !== "running" || demoActiveStepIndex === -1) return;

    const currentSteps = [...demoSteps];
    
    // Set current step to running
    currentSteps[demoActiveStepIndex].status = "running";
    setDemoSteps(currentSteps);

    const timer = setTimeout(() => {
      // Complete current step
      const completedSteps = [...demoSteps];
      completedSteps[demoActiveStepIndex].status = "success";
      
      const nextIndex = demoActiveStepIndex + 1;
      if (nextIndex < completedSteps.length) {
        setDemoSteps(completedSteps);
        setDemoActiveStepIndex(nextIndex);
      } else {
        // Complete the whole monitoring sequence
        setDemoSteps(completedSteps);
        setDemoStatus("success");
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [demoStatus, demoActiveStepIndex]);

  // Initial trigger for first workflow demo
  useEffect(() => {
    runWorkflowMonitor(0);
  }, []);

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 35;
    const y = (e.clientY - rect.top - rect.height / 2) / 35;
    setMousePos({ x, y });
  };

  const handleHeroMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div className="app-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* Sticky Header */}
      <Navbar>
        <a href="/agent-studio" className="btn btn-secondary btn-sm" style={{ textDecoration: "none", fontSize: "12px", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <BoltIcon size={12} /> Studio
        </a>
        <a href="/chat" className="btn btn-primary btn-sm" style={{ textDecoration: "none", fontSize: "12px", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "4px" }}>
          Launch App <BoltIcon size={12} />
        </a>
      </Navbar>

      <main style={{ flex: 1, width: "100%", overflow: "hidden" }}>
        
        {/* HERO SECTION */}
        <section 
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
          style={{ 
            position: "relative",
            textAlign: "center", 
            padding: "120px 24px 80px 24px", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            gap: "24px",
            background: "radial-gradient(circle at center, rgba(255, 107, 74, 0.03) 0%, transparent 70%)"
          }}
        >
          {/* Subtle Parallax Background Glow */}
          <div 
            style={{ 
              position: "absolute",
              top: "20%",
              left: "50%",
              transform: `translate(-50%, -50%) translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)`,
              width: "500px",
              height: "500px",
              background: "radial-gradient(circle, rgba(255, 107, 74, 0.08) 0%, transparent 60%)",
              filter: "blur(60px)",
              pointerEvents: "none",
              zIndex: -1,
              transition: "transform 0.1s ease-out"
            }} 
          />

          <span className="animate-pulse" style={{ fontSize: "0.75rem", textTransform: "uppercase", background: "rgba(255,107,74,0.12)", color: "var(--color-primary)", padding: "6px 14px", borderRadius: "100px", fontWeight: 700, letterSpacing: "0.08em", border: "1px solid rgba(255, 107, 74, 0.2)" }}>
            ⚡ AI-First Stablecoin Infrastructure
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-center" style={{ lineHeight: 1.1, maxWidth: "900px", color: "var(--color-text-primary)", letterSpacing: "-0.04em" }}>
            Send Global Stablecoin Payments Using <span style={{ background: "linear-gradient(to right, var(--color-primary), #ffa38a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Natural Language</span>
          </h1>
          
          <p style={{ fontSize: "1.2rem", color: "var(--color-text-secondary)", maxWidth: "700px", lineHeight: 1.6, margin: "8px 0" }}>
            Built for startups, fintechs, and global businesses to automate international payouts, treasury operations, and yield sweeps using secure, gasless stablecoin infrastructure.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4" style={{ justifyContent: "center" }}>
            <a href="/chat" className="btn btn-primary btn-lg" style={{ padding: "14px 28px", fontSize: "0.975rem", fontWeight: "bold", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              Launch AI Workspace <BoltIcon size={18} />
            </a>
            <a href="/docs" className="btn btn-secondary btn-lg" style={{ padding: "14px 28px", fontSize: "0.975rem", fontWeight: "bold", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              Read Documentation <DocsIcon size={18} />
            </a>
          </div>
        </section>

        {/* TRUST BAR */}
        <section style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)", background: "rgba(12, 14, 24, 0.5)", padding: "28px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <p style={{ textAlign: "center", fontSize: "0.725rem", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, marginBottom: "20px" }}>
              DEVELOPER-FIRST STABLECOIN ARCHITECTURE
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "24px", alignItems: "center", justifyItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-secondary)", fontSize: "0.875rem", fontWeight: 600 }}>
                <span style={{ display: "inline-flex", width: "8px", height: "8px", borderRadius: "50%", background: "#06b6d4" }} />
                Powered by Circle
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-secondary)", fontSize: "0.875rem", fontWeight: 600 }}>
                <span style={{ display: "inline-flex", width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-primary)" }} />
                Built on Arc Testnet
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-secondary)", fontSize: "0.875rem", fontWeight: 600 }}>
                <span style={{ display: "inline-flex", width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                Smart Accounts (ERC-4337)
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-secondary)", fontSize: "0.875rem", fontWeight: 600 }}>
                <span style={{ display: "inline-flex", width: "8px", height: "8px", borderRadius: "50%", background: "#eab308" }} />
                Gasless Transactions
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-secondary)", fontSize: "0.875rem", fontWeight: 600 }}>
                <span style={{ display: "inline-flex", width: "8px", height: "8px", borderRadius: "50%", background: "#d946ef" }} />
                Developer Payout APIs
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCTION WORKFLOW MONITOR */}
        <section style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-primary)" }}>On-Chain Treasury Workflows in Real-Time</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", marginTop: "8px" }}>
              Monitor how the agent orchestrator dynamically parses parameters, executes compliance screening, sponsors gas, and settles on the Arc Testnet.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left side selectors */}
            <div className="lg:col-span-4" style={{ display: "flex", flexDirection: "column", gap: "16px", justifyContent: "center" }}>
              {demoScenarios.map((scenario, idx) => (
                <button
                  key={idx}
                  onClick={() => runWorkflowMonitor(idx)}
                  disabled={demoStatus === "typing" || demoStatus === "running"}
                  style={{
                    textAlign: "left",
                    padding: "20px",
                    background: selectedDemoIndex === idx ? "rgba(255, 107, 74, 0.05)" : "rgba(255, 255, 255, 0.01)",
                    border: selectedDemoIndex === idx ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
                    borderRadius: "16px",
                    cursor: (demoStatus === "typing" || demoStatus === "running") ? "not-allowed" : "pointer",
                    transition: "all var(--transition-base)"
                  }}
                  className="hover-lift"
                >
                  <span style={{ fontSize: "0.75rem", color: selectedDemoIndex === idx ? "var(--color-primary)" : "var(--color-text-tertiary)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    0{idx + 1}. {scenario.title}
                  </span>
                  <strong style={{ fontSize: "1rem", color: "var(--color-text-primary)", display: "block", marginBottom: "4px" }}>
                    {scenario.prompt}
                  </strong>
                  <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", display: "block" }}>
                    {scenario.description}
                  </span>
                </button>
              ))}
            </div>

            {/* Right side Terminal & Timeline Window */}
            <div className="lg:col-span-8">
              <div 
                style={{ 
                  background: "var(--color-bg-secondary)", 
                  border: "1px solid var(--color-border)", 
                  borderRadius: "20px", 
                  overflow: "hidden",
                  boxShadow: "var(--shadow-lg), 0 0 40px rgba(255,107,74,0.02)"
                }}
              >
                {/* Header Window Bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#05060b", padding: "14px 20px", borderBottom: "1px solid var(--color-border)" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
                  </div>
                  <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-tertiary)" }}>
                    WireStable Console — 0x8922...3b1d
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span className="animate-pulse" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
                    <span style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>Arc Testnet Active</span>
                  </div>
                </div>

                {/* Workspace Body */}
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Chat input segment */}
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>&gt;</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: "var(--color-text-primary)" }}>{demoPromptText}</span>
                      {demoStatus === "typing" && (
                        <span className="animate-pulse" style={{ display: "inline-block", width: "8px", height: "16px", background: "var(--color-primary)", marginLeft: "4px" }} />
                      )}
                    </div>
                  </div>

                  {/* AI Response steps */}
                  {(demoStatus === "running" || demoStatus === "success") && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px dashed var(--color-border)", paddingTop: "16px" }}>
                      
                      {/* Typing indicator for start */}
                      {demoStatus === "running" && demoActiveStepIndex === 0 && (
                        <div className="typing-indicator" style={{ padding: "0 0 10px 0" }}>
                          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)", marginRight: "8px" }}>AI Agent planning payload</span>
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </div>
                      )}

                      {/* Timeline steps mapping */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingLeft: "4px" }}>
                        {demoSteps.map((step, stepIdx) => {
                          const isCompleted = step.status === "success";
                          const isRunning = step.status === "running";
                          return (
                            <div 
                              key={stepIdx} 
                              style={{ 
                                display: "flex", 
                                gap: "14px", 
                                alignItems: "flex-start",
                                opacity: step.status === "pending" ? 0.35 : 1,
                                transition: "all 0.3s ease"
                              }}
                            >
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "2px" }}>
                                {isCompleted ? (
                                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                                  </div>
                                ) : isRunning ? (
                                  <div className="animate-spin" style={{ width: "16px", height: "16px", border: "2px solid var(--color-primary)", borderTopColor: "transparent", borderRadius: "50%" }} />
                                ) : (
                                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "1.5px solid var(--color-border)" }} />
                                )}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: isCompleted ? "var(--color-text-primary)" : isRunning ? "var(--color-primary)" : "var(--color-text-secondary)" }}>
                                  {step.label}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                                  {step.detail}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* SUCCESS CARD SUMMARY */}
                      {demoStatus === "success" && (
                        <div 
                          className="animate-fade-in"
                          style={{ 
                            background: "rgba(16, 185, 129, 0.04)", 
                            border: "1px solid rgba(16, 185, 129, 0.25)", 
                            borderRadius: "16px", 
                            padding: "20px", 
                            marginTop: "8px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            boxShadow: "0 4px 20px rgba(16, 185, 129, 0.03)"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ display: "inline-flex", background: "rgba(16, 185, 129, 0.15)", borderRadius: "50%", padding: "4px" }}>
                                <CheckIcon size={14} className="text-[#10b981]" />
                              </span>
                              <strong style={{ fontSize: "0.875rem", color: "var(--color-text-primary)" }}>Transaction Settled Successfully</strong>
                            </div>
                            <span className="status-badge status-badge-success">Success</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" style={{ fontSize: "0.75rem", borderTop: "1px solid rgba(16, 185, 129, 0.15)", paddingTop: "12px" }}>
                            <div>
                              <span style={{ color: "var(--color-text-tertiary)" }}>Transferred Value:</span>
                              <div style={{ fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>{demoScenarios[selectedDemoIndex].successDetail.amount}</div>
                            </div>
                            <div>
                              <span style={{ color: "var(--color-text-tertiary)" }}>Target Account / Vault:</span>
                              <div style={{ fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>{demoScenarios[selectedDemoIndex].successDetail.recipient}</div>
                            </div>
                            {demoScenarios[selectedDemoIndex].successDetail.rate && (
                              <div>
                                <span style={{ color: "var(--color-text-tertiary)" }}>Execution Rate:</span>
                                <div style={{ fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>{demoScenarios[selectedDemoIndex].successDetail.rate}</div>
                              </div>
                            )}
                            <div>
                              <span style={{ color: "var(--color-text-tertiary)" }}>Gas Sponsorship:</span>
                              <div style={{ fontWeight: 700, color: "#10b981", fontFamily: "var(--font-mono)", marginTop: "2px" }}>{demoScenarios[selectedDemoIndex].successDetail.gasSaved}</div>
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.6875rem", borderTop: "1px dashed rgba(16, 185, 129, 0.15)", paddingTop: "10px", color: "var(--color-text-tertiary)" }}>
                            <span>Explorer Tx: <strong style={{ fontFamily: "var(--font-mono)" }}>{demoScenarios[selectedDemoIndex].successDetail.txHash}</strong></span>
                            <a href={`/docs#${demoScenarios[selectedDemoIndex].successDetail.txHash}`} style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 700 }}>Verify on Explorer ➔</a>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </section>

        {/* PROBLEM → SOLUTION SECTION */}
        <section style={{ borderTop: "1px solid var(--color-border)", background: "rgba(12, 14, 24, 0.2)", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "4px 12px", borderRadius: "100px", fontWeight: 700, letterSpacing: "0.05em" }}>
                Friction vs Flow
              </span>
              <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--color-text-primary)", marginTop: "12px" }}>Legacy Banking vs. WireStable</h2>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", marginTop: "8px" }}>
                How WireStable eliminates complexity and slashes overhead.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Problem Column */}
              <div 
                style={{ 
                  background: "rgba(239, 68, 68, 0.02)", 
                  border: "1px solid rgba(239, 68, 68, 0.12)", 
                  borderRadius: "24px", 
                  padding: "32px" 
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                  <span style={{ background: "rgba(239, 68, 68, 0.15)", borderRadius: "50%", padding: "6px", display: "inline-flex" }}>
                    <CloseIcon size={18} className="text-[#ef4444]" />
                  </span>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text-primary)" }}>Legacy Banking Workflows</h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <strong style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>Expensive Cross-Border Payments</strong>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      High flat wire fees ($35+) compounded by 2-3% hidden foreign exchange markups.
                    </p>
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>Manual Treasury Operations</strong>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      Manually monitoring capital limits, re-routing funds, and calculating sweep formulas.
                    </p>
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>FX Corridor Volatility</strong>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      Exposing payroll value to currency drops during the 3-5 days banks take to settle.
                    </p>
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>Fragmented Banking Pipelines</strong>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      Connecting multiple regional banking APIs or executing manual transfers daily.
                    </p>
                  </div>
                </div>
              </div>

              {/* Solution Column */}
              <div 
                style={{ 
                  background: "rgba(16, 185, 129, 0.02)", 
                  border: "1px solid rgba(16, 185, 129, 0.12)", 
                  borderRadius: "24px", 
                  padding: "32px" 
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                  <span style={{ background: "rgba(16, 185, 129, 0.15)", borderRadius: "50%", padding: "6px", display: "inline-flex" }}>
                    <CheckIcon size={18} className="text-[#10b981]" />
                  </span>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text-primary)" }}>WireStable Autonomous Rails</h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <strong style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>Zero-Fee Sponsored Rails</strong>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      Paymaster-sponsored gas removes network gas fees entirely for end users.
                    </p>
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>Autonomous Sweep Agent</strong>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      Automated yield sweep rules optimize balances, earning 5.15% APY in real-time.
                    </p>
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>24H Cryptographic Option Locks</strong>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      Lock corridor exchange rates (e.g. USDC to EURC) to safeguard payroll payouts.
                    </p>
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>Sub-Second Finality</strong>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      Immediate ledger settlement in under 350ms via Arc Network stablecoin rails.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* VALUE BENEFITS SECTION */}
        <section id="features" style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--color-text-primary)" }}>Value-Driven Stablecoin Operations</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", marginTop: "8px" }}>
              Engineered to optimize treasury efficiency, compliance, and developer speed.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            
            <div className="card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ color: "var(--color-primary)", display: "flex", alignItems: "center" }}>
                <BoltIcon size={36} animate />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800 }}>No Gas Fees For End Users</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Our EIP-7708 Paymaster handles on-chain transaction fee sponsorship in USDC behind the scenes, eliminating the need to acquire L1 gas tokens.
              </p>
            </div>

            <div className="card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ color: "var(--color-primary)", display: "flex", alignItems: "center" }}>
                <BrainIcon size={36} />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800 }}>Automate Treasury Sweeps</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Configure rules for AI treasury agents to sweep idle operational balances above thresholds into tokenized vaults yielding 5.15% APY.
              </p>
            </div>

            <div className="card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ color: "var(--color-primary)", display: "flex", alignItems: "center" }}>
                <SyncIcon size={36} animate />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800 }}>Mitigate FX Corridor Shifts</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Secure stable exchange values by deploying cryptographic ERC-8004 FX rate locks, protecting payouts from volatile currency volatility.
              </p>
            </div>

            <div className="card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ color: "var(--color-primary)", display: "flex", alignItems: "center" }}>
                <ShieldIcon size={36} />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800 }}>Compliant Payout Screening</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Recipients automatically pass wallet security checks. Rest easy with maker-checker approvals and customizable compliance rules.
              </p>
            </div>

          </div>
        </section>

        {/* WHO IT'S FOR */}
        <section style={{ borderTop: "1px solid var(--color-border)", background: "rgba(12, 14, 24, 0.3)", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", background: "rgba(255,107,74,0.1)", color: "var(--color-primary)", padding: "4px 12px", borderRadius: "100px", fontWeight: 700, letterSpacing: "0.05em" }}>
                Target Segments
              </span>
              <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--color-text-primary)", marginTop: "12px" }}>Built for Modern Financial Workflows</h2>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", marginTop: "8px" }}>
                Tailored interfaces and parameters for teams of all sizes.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
              
              <div className="card" style={{ padding: "28px" }}>
                <strong style={{ fontSize: "1.125rem", color: "var(--color-text-primary)", display: "block", marginBottom: "10px" }}>Startups & Scaleups</strong>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Pay global contractors, developers, and team members worldwide instantly in USDC/EURC. Save thousands monthly on traditional bank wire fees.
                </p>
              </div>

              <div className="card" style={{ padding: "28px" }}>
                <strong style={{ fontSize: "1.125rem", color: "var(--color-text-primary)", display: "block", marginBottom: "10px" }}>Fintech Builders</strong>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Embed stablecoin payouts, conversions, and passkey wallet abstraction directly into your consumer application using our developer REST APIs.
                </p>
              </div>

              <div className="card" style={{ padding: "28px" }}>
                <strong style={{ fontSize: "1.125rem", color: "var(--color-text-primary)", display: "block", marginBottom: "10px" }}>Treasury Operations</strong>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Establish rule-based limits, automate yield sweeping of idle funds, and enforce maker-checker dual authorization settings for high-value payouts.
                </p>
              </div>

              <div className="card" style={{ padding: "28px" }}>
                <strong style={{ fontSize: "1.125rem", color: "var(--color-text-primary)", display: "block", marginBottom: "10px" }}>Global Payroll & Ops</strong>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Execute high-volume payouts to global contractors via bulk CSV uploads. Eliminate FX volatility using rate-locked payment rails.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" style={{ borderTop: "1px solid var(--color-border)", padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--color-text-primary)" }}>How It Works in 3 Steps</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", marginTop: "8px" }}>
              From conversational user intent to finality on the ledger.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px", position: "relative" }}>
            
            {/* Step 1 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <strong style={{ fontSize: "2rem", color: "var(--color-primary)", lineHeight: 1 }}>01</strong>
                <div style={{ height: "1px", flex: 1, background: "linear-gradient(to right, var(--color-primary), var(--color-border))" }} />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, marginTop: "8px" }}>Secure MPC Onboarding</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                Authenticate instantly via email. We deploy a non-custodial Circle User-Controlled Smart Contract Account secured by your local hardware enclave.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <strong style={{ fontSize: "2rem", color: "var(--color-primary)", lineHeight: 1 }}>02</strong>
                <div style={{ height: "1px", flex: 1, background: "linear-gradient(to right, var(--color-primary), var(--color-border))" }} />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, marginTop: "8px" }}>Enter Intent or Commands</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                Type or talk to specify payout amounts, target networks, and FX corridors. Alternatively, set automated limits for treasury sweep operations.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <strong style={{ fontSize: "2rem", color: "var(--color-primary)", lineHeight: 1 }}>03</strong>
                <div style={{ height: "1px", flex: 1, background: "transparent" }} />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, marginTop: "8px" }}>Sponsor and Settle</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                Our Paymaster signs to sponsor the transaction gas. The transaction is immediately settled on-chain on the Arc Chain in less than 350ms.
              </p>
            </div>

          </div>
        </section>

        {/* SUPPORTED INTEGRATIONS */}
        <section style={{ borderTop: "1px solid var(--color-border)", background: "rgba(12, 14, 24, 0.4)", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--color-text-primary)" }}>Our Core Infrastructure Stack</h2>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", marginTop: "8px" }}>
                We build directly upon verified on-chain developer systems.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
              
              <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--color-border)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <strong style={{ fontSize: "1rem", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <LinkIcon size={18} className="text-[#06b6d4]" /> Circle Web3 App Kit
                </strong>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Securing user operations via hardware passkeys and non-custodial Smart Contract Accounts.
                </p>
              </div>

              <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--color-border)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <strong style={{ fontSize: "1rem", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <LinkIcon size={18} className="text-[var(--color-primary)]" /> Arc Chain Ledger
                </strong>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Native gas-abstracted execution ledger that enables sub-second transaction validation.
                </p>
              </div>

              <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--color-border)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <strong style={{ fontSize: "1rem", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <LinkIcon size={18} className="text-[#10b981]" /> Developer REST API
                </strong>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Integrate stablecoin sweeps, options, and wallets with robust JSON endpoints.
                </p>
              </div>

              <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--color-border)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <strong style={{ fontSize: "1rem", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <LinkIcon size={18} className="text-[#eab308]" /> Webhook Streams
                </strong>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Subscribe to real-time events for compliance updates and transaction finality.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ENTERPRISE SECURITY */}
        <section style={{ borderTop: "1px solid var(--color-border)", padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
          
          <div className="grid grid-cols-1 md:grid-cols-11 gap-12 items-center">
            
            <div className="md:col-span-5">
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "4px 12px", borderRadius: "100px", fontWeight: 700, letterSpacing: "0.05em" }}>
                Military-Grade Guardrails
              </span>
              <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--color-text-primary)", marginTop: "12px", lineHeight: 1.2 }}>
                Enterprise-Grade Security & Governance
              </h2>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", marginTop: "12px", lineHeight: 1.6 }}>
                Secure on-chain execution combined with robust policy settings. WireStable isolates funds using non-custodial enclaves.
              </p>
              <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ background: "rgba(16, 185, 129, 0.15)", borderRadius: "50%", padding: "4px", display: "inline-flex", height: "fit-content" }}>
                    <CheckIcon size={14} className="text-[#10b981]" />
                  </span>
                  <div>
                    <strong style={{ fontSize: "0.875rem", color: "var(--color-text-primary)", display: "block" }}>Circle MPC Architecture</strong>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Keys are securely split and processed on device enclaves. Nobody else can access them.</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ background: "rgba(16, 185, 129, 0.15)", borderRadius: "50%", padding: "4px", display: "inline-flex", height: "fit-content" }}>
                    <CheckIcon size={14} className="text-[#10b981]" />
                  </span>
                  <div>
                    <strong style={{ fontSize: "0.875rem", color: "var(--color-text-primary)", display: "block" }}>Maker-Checker Approval Engine</strong>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Set dual approval levels. Execute sweep limits or payments only with CFO sign-off.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="card" style={{ padding: "24px" }}>
                <LockIcon size={28} className="text-[var(--color-primary)]" style={{ marginBottom: "12px" }} />
                <strong style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)", display: "block", marginBottom: "6px" }}>Passkey Enclaves</strong>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Approve transfers gaslessly using native biometric sensors (TouchID, FaceID, Windows Hello).
                </p>
              </div>
              <div className="card" style={{ padding: "24px" }}>
                <ShieldIcon size={28} className="text-[var(--color-primary)]" style={{ marginBottom: "12px" }} />
                <strong style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)", display: "block", marginBottom: "6px" }}>Policy Engine</strong>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Establish rule parameters: block payouts to addresses with safety reputation scores below 85.
                </p>
              </div>
              <div className="card" style={{ padding: "24px" }}>
                <SyncIcon size={28} className="text-[var(--color-primary)]" style={{ marginBottom: "12px" }} />
                <strong style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)", display: "block", marginBottom: "6px" }}>On-Chain Audit Trails</strong>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Every conversational execution leaves an immutable, cryptographically verifiable ledger audit trial.
                </p>
              </div>
              <div className="card" style={{ padding: "24px" }}>
                <BuildingIcon size={28} className="text-[var(--color-primary)]" style={{ marginBottom: "12px" }} />
                <strong style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)", display: "block", marginBottom: "6px" }}>Compliance Screening</strong>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Automated checks run on destination wallets to prevent transfers to embargoed or flagged entities.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* USE CASES */}
        <section style={{ borderTop: "1px solid var(--color-border)", background: "rgba(12, 14, 24, 0.2)", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--color-text-primary)" }}>Real-World Treasury Workflows</h2>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", marginTop: "8px" }}>
                How corporations utilize WireStable for day-to-day operations.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
              
              {/* Use Case 1 */}
              <div className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", background: "var(--color-accent-bg)", color: "var(--color-primary)", padding: "2px 10px", borderRadius: "4px", fontWeight: 700, width: "fit-content" }}>
                  Global Payroll
                </span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                  Distribute Payroll Instantly
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  <strong>Problem:</strong> Wiring payroll to 40+ overseas contractors incurred $1,400 in fees and 4 days of delays.<br />
                  <strong>Workflow:</strong> AI Agent maps list: Alice ($2k), Bob ($3k), Paris. Sponsored gas transfers settle in seconds.<br />
                  <strong>Outcome:</strong> 0% transaction gas costs, settled in less than a second.
                </p>
              </div>

              {/* Use Case 2 */}
              <div className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", background: "var(--color-accent-bg)", color: "var(--color-primary)", padding: "2px 10px", borderRadius: "4px", fontWeight: 700, width: "fit-content" }}>
                  Active Treasury
                </span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                  Automate Compound Yield Sweeps
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  <strong>Problem:</strong> Idle operational capital sat in traditional bank accounts earning 0.1% interest.<br />
                  <strong>Workflow:</strong> Set AI rule: "Sweep balances exceeding $15k to compounding yield vault hourly."<br />
                  <strong>Outcome:</strong> Surplus balances automatically swept, earning 5.15% APY compounding.
                </p>
              </div>

              {/* Use Case 3 */}
              <div className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", background: "var(--color-accent-bg)", color: "var(--color-primary)", padding: "2px 10px", borderRadius: "4px", fontWeight: 700, width: "fit-content" }}>
                  FX Volatility
                </span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                  Lock Currency Rates for Suppliers
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  <strong>Problem:</strong> Swift conversions during 3-day transits resulted in unpredictable payout values.<br />
                  <strong>Workflow:</strong> Deploy ERC-8004 24h locked options rate locks to fix the swap corridor values.<br />
                  <strong>Outcome:</strong> Payout values secured. Zero currency degradation during transits.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* DEVELOPER EXPERIENCE (DX) */}
        <section style={{ borderTop: "1px solid var(--color-border)", padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
          
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-12 items-center">
            
            <div className="lg:col-span-5">
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", background: "rgba(255,107,74,0.1)", color: "var(--color-primary)", padding: "4px 12px", borderRadius: "100px", fontWeight: 700, letterSpacing: "0.05em" }}>
                Developer Portal
              </span>
              <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--color-text-primary)", marginTop: "12px", lineHeight: 1.2 }}>
                Developer-First API & SDKs
              </h2>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", marginTop: "12px", lineHeight: 1.6 }}>
                Integrate robust stablecoin remittance capabilities into your billing platforms, payroll portals, or software apps in minutes.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div>
                  <strong style={{ fontSize: "0.875rem", color: "var(--color-text-primary)", display: "block" }}>Interactive Developer Workspace</strong>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>Deploy sweeps, payouts, and option locks on the Arc Testnet using live configurations.</p>
                </div>
                <div>
                  <strong style={{ fontSize: "0.875rem", color: "var(--color-text-primary)", display: "block" }}>Robust Webhook Streams</strong>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>Receive immediate HTTP POST requests when on-chain payouts clear.</p>
                </div>
              </div>

              <div style={{ marginTop: "32px" }}>
                <a href="/docs" className="btn btn-secondary" style={{ textDecoration: "none", fontWeight: "bold" }}>
                  View Full API Reference ➔
                </a>
              </div>
            </div>

            {/* Interactive Code Snippet Box */}
            <div className="lg:col-span-6" style={{ border: "1px solid var(--color-border)", borderRadius: "20px", overflow: "hidden", background: "#05060b" }}>
              <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", padding: "10px 16px", background: "rgba(255,255,255,0.01)", gap: "10px" }}>
                {(["ts", "py", "curl"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveCodeTab(lang)}
                    style={{
                      border: "none",
                      color: activeCodeTab === lang ? "var(--color-primary)" : "var(--color-text-tertiary)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: activeCodeTab === lang ? "rgba(255, 107, 74, 0.08)" : "transparent",
                      transition: "all var(--transition-fast)"
                    }}
                  >
                    {lang === "ts" ? "TypeScript SDK" : lang === "py" ? "Python SDK" : "cURL"}
                  </button>
                ))}
              </div>
              
              <div style={{ padding: "20px", overflowX: "auto" }}>
                <pre style={{ fontSize: "0.8125rem", fontFamily: "var(--font-mono)", color: "#cbd5e1", lineHeight: 1.5, margin: 0 }}>
                  <code>{CODE_SNIPPETS[activeCodeTab]}</code>
                </pre>
              </div>
            </div>

          </div>
        </section>

        {/* FAQ SECTION */}
        <section style={{ borderTop: "1px solid var(--color-border)", background: "rgba(12, 14, 24, 0.2)", padding: "80px 24px" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--color-text-primary)" }}>Frequently Asked Questions</h2>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", marginTop: "8px" }}>
                Everything you need to know about WireStable.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                {
                  q: "Do I need to hold volatile crypto to pay transaction gas fees?",
                  a: "No. WireStable operates using an EIP-7708 Paymaster on the Arc Chain to sponsor 100% of network gas fees. Users only need standard stablecoins (USDC/EURC)."
                },
                {
                  q: "Who covers the gas fee sponsorship costs?",
                  a: "WireStable sponsors gas fees for all testnet workspace operations. Production APIs integrate standard fee parameters to absorb gas sponsorship overhead directly inside transactions."
                },
                {
                  q: "Which wallets are supported?",
                  a: "We support non-custodial Circle User-Controlled Smart Wallets secured via WebAuthn passkeys (TouchID, FaceID, device PIN). We also support standard EVM developer client wallets."
                },
                {
                  q: "How secure is the platform's key storage?",
                  a: "Extremely secure. WireStable utilizes Circle's Web3 App Kit Multi-Party Computation (MPC). Cryptographic keys are split and secured directly inside your device's hardware enclave, preventing external access."
                },
                {
                  q: "How does the compliance screening engine work?",
                  a: "Every transaction address undergoes screening against compliance risk databases prior to settlement. Addresses returning low reputation scores are quarantined, requiring Checker approval."
                },
                {
                  q: "How long does transaction settlement take?",
                  a: "Because transactions are deployed directly onto the Arc Chain L2, block times and finality settle in less than 350 milliseconds."
                }
              ].map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx}
                    style={{ 
                      background: "var(--color-surface)", 
                      border: "1px solid var(--color-border)", 
                      borderRadius: "16px",
                      overflow: "hidden",
                      transition: "all var(--transition-base)"
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        padding: "20px 24px",
                        textAlign: "left",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        color: "var(--color-text-primary)"
                      }}
                    >
                      <strong style={{ fontSize: "0.9375rem" }}>{faq.q}</strong>
                      <span style={{ fontSize: "1.25rem", color: "var(--color-primary)", lineHeight: 1 }}>
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 24px 20px 24px", fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.6, borderTop: "1px dashed var(--color-border)", paddingTop: "12px" }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section 
          style={{ 
            textAlign: "center", 
            padding: "100px 24px", 
            borderTop: "1px solid var(--color-border)",
            background: "radial-gradient(circle at center, rgba(255, 107, 74, 0.04) 0%, transparent 60%)",
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            gap: "24px" 
          }}
        >
          <h2 className="text-3xl md:text-5xl font-black" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>
            Automate Your Global Treasury Today
          </h2>
          
          <p style={{ fontSize: "1.1rem", color: "var(--color-text-secondary)", maxWidth: "600px", lineHeight: 1.6 }}>
            Experience secure, gasless stablecoin payouts and yield sweeps. Deploy your first workspace in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-2" style={{ width: "100%", justifyContent: "center" }}>
            <a href="/chat" className="btn btn-primary btn-lg" style={{ textDecoration: "none", padding: "14px 28px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              Launch AI Workspace <BoltIcon size={18} />
            </a>
            <a href="/agent-studio" className="btn btn-secondary btn-lg" style={{ textDecoration: "none", padding: "14px 28px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              Developer Studio <BoltIcon size={18} />
            </a>
          </div>
        </section>

      </main>

      {/* EXPANDED FOOTER */}
      <footer style={{ borderTop: "1px solid var(--color-border)", background: "rgba(5, 6, 11, 0.98)", padding: "64px 24px 32px 24px", fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px" }}>
          
          {/* Brand Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ background: "var(--color-primary)", color: "var(--color-text-inverse)", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <WireStableLogo size={16} className="text-white" />
              </span>
              <strong style={{ fontSize: "1.125rem", color: "var(--color-text-primary)" }}>WireStable</strong>
            </div>
            <p style={{ color: "var(--color-text-tertiary)", lineHeight: 1.6, margin: 0 }}>
              AI-first stablecoin remittance and treasury infrastructure powered by Circle Web3 App Kit and the Arc L2 Network.
            </p>
            <div style={{ display: "flex", gap: "14px", marginTop: "4px" }}>
              <a href="https://github.com/wirestable" target="_blank" rel="noreferrer" style={{ color: "var(--color-text-tertiary)", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">
                <GithubIcon size={18} />
              </a>
              <a href="https://twitter.com/wirestable" target="_blank" rel="noreferrer" style={{ color: "var(--color-text-tertiary)", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">
                <TwitterIcon size={18} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <strong style={{ color: "var(--color-text-primary)", fontSize: "0.875rem", fontWeight: 700 }}>Product Workspace</strong>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><a href="/chat" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Remit Chat App</a></li>
              <li><a href="/agent-studio" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">AgentOS Studio</a></li>
              <li><a href="/admin" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Corporate Treasury Hub</a></li>
              <li><a href="/docs#payout" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Compliance Scoring</a></li>
            </ul>
          </div>

          {/* Developer Resources */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <strong style={{ color: "var(--color-text-primary)", fontSize: "0.875rem", fontWeight: 700 }}>Developer Resources</strong>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><a href="/docs" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Documentation Portal</a></li>
              <li><a href="/docs#architecture" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">System Architecture</a></li>
              <li><a href="/docs#api-payout" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">REST API Reference</a></li>
              <li><a href="/docs#errors" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Error Dictionary</a></li>
              <li><a href="https://status.wirestable.xyz" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Network Status</a></li>
            </ul>
          </div>

          {/* Security & Legal */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <strong style={{ color: "var(--color-text-primary)", fontSize: "0.875rem", fontWeight: 700 }}>Security & Legal</strong>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><a href="/privacy" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Privacy Policy</a></li>
              <li><a href="/terms" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Terms of Service</a></li>
              <li><a href="/docs#ucw" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">MPC Enclaves Security</a></li>
              <li><a href="/about" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">About Team</a></li>
              <li><a href="/contact" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Support Desk</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ maxWidth: "1200px", margin: "48px auto 0 auto", paddingTop: "24px", borderTop: "1px solid var(--color-border)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "16px", color: "var(--color-text-tertiary)", fontSize: "0.75rem" }}>
          <span>© 2026 WireStable. All rights reserved.</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
            <span>Arc Testnet Status: Active (USDC Native Gas)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
