import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DiscoveryEngine } from "@/components/DiscoveryEngine";

export function LandingView() {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [simulationRunning, setSimulationRunning] = useState(false);


  const mockPrompts = [
    {
      title: "Cross-Border Payout",
      prompt: "Pay $250.00 USDC to Alice in Berlin and swap remaining treasury to EURC.",
      steps: [
        "1. AI parses remittance parameters: $250.00 USDC to Alice, destination chain: ARC, swap balance: EURC.",
        "2. Compliance API scans Alice's address: Score 98 (Safe to transact).",
        "3. Circle smart wallet initializes EIP-712 challenge token.",
        "4. Paymaster sponsors gasless transfer. Settled on-chain in 350ms."
      ]
    },
    {
      title: "FX Option Rate Lock",
      prompt: "Lock USDC-EURC rate for $10,000 corporate payroll corridor.",
      steps: [
        "1. Fetch live 24h Spot rate vs Option volatility matrix.",
        "2. Quote computed: Spot 0.9212, Lock 0.9245 (Premium: 1.50 USDC).",
        "3. Deploy ERC-8004 cryptographic lock request to Arc Chain.",
        "4. Option activated. Rates secured against corridor volatility."
      ]
    },
    {
      title: "USDC Treasury Sweep",
      prompt: "Auto-sweep 80% of idle corporate USDC balance into yield token.",
      steps: [
        "1. Oracle monitors liquid balance threshold.",
        "2. Compute sweep delta: 8,400 USDC exceeding operational limit.",
        "3. Trigger transaction to mint yield-bearing token (USYC).",
        "4. Active sweep rules running at 5.15% APY compounding."
      ]
    }
  ];

  const runSimulation = (idx: number) => {
    if (simulationRunning) return;
    setSelectedPrompt(mockPrompts[idx].prompt);
    setActiveStep(0);
    setSimulationRunning(true);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < mockPrompts[idx].steps.length) {
        setActiveStep(step);
      } else {
        clearInterval(interval);
        setSimulationRunning(false);
      }
    }, 1200);
  };

  return (
    <div className="app-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      <Navbar>
        <a href="/agent-studio" className="btn btn-secondary btn-sm" style={{ textDecoration: "none", fontSize: "12px", fontWeight: "bold" }}>
          🧪 Studio
        </a>
        <a href="/chat" className="btn btn-primary btn-sm" style={{ textDecoration: "none", fontSize: "12px", fontWeight: "bold" }}>
          Launch App ⚡
        </a>
      </Navbar>

      {/* Main Hero & Content */}
      <main style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "0 24px" }}>
        
        {/* HERO SECTION */}
        <section style={{ textAlign: "center", padding: "80px 0 60px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", background: "rgba(255,107,74,0.1)", color: "var(--color-primary)", padding: "4px 12px", borderRadius: "100px", fontWeight: 700, letterSpacing: "0.05em" }}>
            Circle & Arc Ecosystem Stack
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-center" style={{ lineHeight: 1.15, maxWidth: "800px", color: "var(--color-text-primary)" }}>
            Conversational Stablecoin Remittances & Yield
          </h1>
          <p style={{ fontSize: "1.125rem", color: "var(--color-text-secondary)", maxWidth: "600px", lineHeight: 1.6 }}>
            Execute cross-border payouts, trigger automated yield sweeps, and run off-chain payment channels gaslessly using natural language.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-3" style={{ justifyContent: "center" }}>
            <a href="/chat" className="btn btn-primary" style={{ padding: "12px 24px", fontSize: "0.9375rem", fontWeight: "bold", textDecoration: "none" }}>
              Launch Chat Remit ⚡
            </a>
            <a href="#how-it-works" className="btn btn-secondary" style={{ padding: "12px 24px", fontSize: "0.9375rem", fontWeight: "bold", textDecoration: "none" }}>
              See How It Works ↓
            </a>
          </div>
        </section>

        {/* INTERACTIVE SHOWCASE SECTION */}
        <section className="card" style={{ padding: "32px", marginBottom: "80px", background: "linear-gradient(135deg, rgba(16,20,38,0.6) 0%, rgba(5,6,11,0.8) 100%)", border: "1px solid var(--color-border)" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, textAlign: "center", marginBottom: "20px" }}>Click to simulate an AI Remittance flow:</h3>
          
          {/* Mock Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            {mockPrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => runSimulation(idx)}
                disabled={simulationRunning}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  padding: "16px",
                  color: "var(--color-text-primary)",
                  textAlign: "left",
                  cursor: simulationRunning ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease"
                }}
                className="hover:border-primary hover:bg-[rgba(255,107,74,0.05)]"
              >
                <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 700, display: "block", marginBottom: "4px" }}>0{idx + 1}. {item.title}</span>
                <strong style={{ fontSize: "0.875rem", display: "block", lineHeight: 1.3 }}>{item.prompt.substring(0, 50)}...</strong>
              </button>
            ))}
          </div>

          {/* Interactive terminal output */}
          <div style={{ background: "#05060b", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "20px", fontFamily: "var(--font-mono)", fontSize: "0.875rem", minHeight: "220px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <span style={{ color: "var(--color-primary)" }}>&gt;</span>
              <span style={{ color: "var(--color-text-primary)" }}>
                {selectedPrompt || "Select a quick prompt above to see execution pipeline..."}
              </span>
            </div>

            {selectedPrompt && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                {mockPrompts.find(p => p.prompt === selectedPrompt)?.steps.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      color: idx <= activeStep ? "var(--color-text-secondary)" : "rgba(255,255,255,0.2)",
                      transition: "color 0.3s ease",
                      paddingLeft: "12px",
                      borderLeft: idx === activeStep ? "2px solid var(--color-primary)" : "2px solid transparent"
                    }}
                  >
                    {step}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* PROBLEM VS SOLUTION SECTION */}
        <section id="features" style={{ padding: "60px 0", borderTop: "1px solid var(--color-border)" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, textAlign: "center", marginBottom: "40px" }}>The Frictionless Stablecoin Gateway</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            <div className="card" style={{ padding: "24px" }}>
              <span style={{ fontSize: "1.5rem" }}>🤖</span>
              <h3 style={{ fontSize: "1.125rem", marginTop: "12px" }}>AI Remittance Agents</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.5 }}>
                No complex forms or wallet selectors. Input your payout targets in conversational text or voice. Our natural language parser maps and checks compliance rules instantly.
              </p>
            </div>

            <div className="card" style={{ padding: "24px" }}>
              <span style={{ fontSize: "1.5rem" }}>⚖️</span>
              <h3 style={{ fontSize: "1.125rem", marginTop: "12px" }}>Maker-Checker Compliance</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.5 }}>
                Ensure corporate safety. Maker rules queue payments, sweep yields, or request rates, while Checker rules require multi-signature approval before executing transfers.
              </p>
            </div>

            <div className="card" style={{ padding: "24px" }}>
              <span style={{ fontSize: "1.5rem" }}>⚡</span>
              <h3 style={{ fontSize: "1.125rem", marginTop: "12px" }}>Gasless Arc Network</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.5 }}>
                Avoid buying native tokens for gas fees. Arc native stablecoin capabilities combined with our EIP-7708 Paymaster handles all transactional fee sponsorship.
              </p>
            </div>

            <div className="card" style={{ padding: "24px" }}>
              <span style={{ fontSize: "1.5rem" }}>🌊</span>
              <h3 style={{ fontSize: "1.125rem", marginTop: "12px" }}>Dynamic Spot Hedging</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.5 }}>
                Mitigate FX volatility. Query real-time rates between USDC and EURC stablecoins, locking down spot swap yields using Circle StableFX API parameters.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" style={{ padding: "60px 0", borderTop: "1px solid var(--color-border)" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, textAlign: "center", marginBottom: "40px" }}>How It Works in 3 Steps</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <strong style={{ fontSize: "2rem", color: "var(--color-primary)" }}>01</strong>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800 }}>Onboard in Seconds</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                Sign in with your email. We automatically generate a secure Circle User-Controlled Smart Contract Account (SCA) secured by your hardware enclave.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <strong style={{ fontSize: "2rem", color: "var(--color-primary)" }}>02</strong>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800 }}>Enter Intent</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                Type or talk to configure payout distributions, deposit into off-chain nanopayment streams, or toggle automated rules for yield sweeping.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <strong style={{ fontSize: "2rem", color: "var(--color-primary)" }}>03</strong>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800 }}>Sponsor and Settle</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                Our backend Paymaster handles gas sponsorship, submitting and executing transactions on the Arc blockchain with sub-second finality.
              </p>
            </div>
          </div>
        </section>

        <DiscoveryEngine category="general" currentPath="/" />

        {/* CALL TO ACTION */}
        <section style={{ textAlign: "center", padding: "80px 0", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: "var(--color-text-primary)", margin: 0 }}>Ready to streamline stablecoin flows?</h2>
          <p style={{ fontSize: "1rem", color: "var(--color-text-secondary)", maxWidth: "500px", margin: 0 }}>
            Experience gasless natural-language payments. Try the sandbox dashboard or launch the live chat app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2" style={{ width: "100%", justifyItems: "center", justifyContent: "center" }}>
            <a href="/chat" className="btn btn-primary" style={{ textDecoration: "none", padding: "12px 24px", textAlign: "center" }}>
              Launch Chat Remit ⚡
            </a>
            <a href="/agent-studio" className="btn btn-secondary" style={{ textDecoration: "none", padding: "12px 24px", textAlign: "center" }}>
              Agent Studio Sandbox 🧪
            </a>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
