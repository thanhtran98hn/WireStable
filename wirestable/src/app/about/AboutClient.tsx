import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DiscoveryEngine } from "@/components/DiscoveryEngine";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  const team = [

    {
      name: "Thanh Tran",
      role: "Lead Protocol Architect & Founder",
      bio: "Blockchain engineer focused on payment infrastructure. Previously built gasless dApps and smart wallet aggregators on EVM environments.",
      avatar: "⚡",
      github: "https://github.com",
      twitter: "https://twitter.com"
    },
    {
      name: "Eric",
      role: "AI Agent & UI Architect",
      bio: "Specialist in large language model function-calling orchestration. Designed the AgentOS natural language parser engine.",
      avatar: "🧠",
      github: "https://github.com",
      twitter: "https://twitter.com"
    }
  ];

  return (
    <div className="app-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Navbar>
        <a href="/" className="btn btn-secondary btn-sm" style={{ textDecoration: "none", fontSize: "11px", fontWeight: "bold" }}>
          🏠 Landing Page
        </a>
        <a href="/chat" className="btn btn-primary btn-sm" style={{ textDecoration: "none", fontSize: "11px", fontWeight: "bold" }}>
          Launch App ⚡
        </a>
      </Navbar>

      {/* Main Content */}
      <main className="app-main" style={{ maxWidth: "800px", margin: "0 auto", padding: "var(--space-6) var(--space-4) 80px var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-6)", width: "100%", flex: 1 }}>
        
        {/* Dynamic Visual Breadcrumbs */}
        <Breadcrumbs items={[{ label: "About", url: "/about" }]} />

        {/* Story / Mission */}
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <span style={{ color: "var(--color-primary)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Our Story</span>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "8px" }}>Bridging AI and Financial Infrastructure</h2>
          <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", marginTop: "14px", lineHeight: 1.6 }}>
            WireStable was engineered to solve a fundamental challenge in corporate payments: although stablecoins represent the future of frictionless capital, executing payments still requires navigating complex Web3 browser extensions, signing complicated raw hex codes, and acquiring gas tokens to pay network fees.
          </p>
          <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", marginTop: "12px", lineHeight: 1.6 }}>
            Our mission is simple: **To make programmable stablecoins human-friendly**. By building a conversational gateway on top of Circle's Programmable Wallet SDK and the Arc Chain's USDC gas infrastructure, we enable anyone to execute secure corporate treasury payouts, hedge volatility risk, and run streaming micro-payments using plain natural language.
          </p>
        </div>

        {/* Vision Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <h3 style={{ fontSize: "1.125rem", color: "var(--color-text-primary)" }}>Our Vision 🚀</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.5 }}>
              A world where capital flow is completely automated. AI agents autonomously manage treasury balances, settle contract milestones in real-time, and purchase resources on-chain without any user friction.
            </p>
          </div>
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <h3 style={{ fontSize: "1.125rem", color: "var(--color-text-primary)" }}>Our Values 🛡️</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.5 }}>
              Security, auditability, and speed. We believe that non-custodial custody must be paired with automated Maker-Checker workflows, allowing businesses to stay compliant without losing velocity.
            </p>
          </div>
        </div>

        {/* Team Grid */}
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "16px" }}>Meet the Founding Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.map((member, idx) => (
              <div key={idx} className="card flex flex-col sm:flex-row gap-4 p-4" style={{ alignItems: "center" }}>
                <div style={{ fontSize: "2.5rem", background: "var(--color-bg-secondary)", width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "1px solid var(--color-border)", flexShrink: 0 }}>
                  {member.avatar}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                  <strong style={{ fontSize: "1rem", color: "var(--color-text-primary)" }}>{member.name}</strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 700 }}>{member.role}</span>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.4 }}>
                    {member.bio}
                  </p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                    <a href={member.github} target="_blank" rel="noreferrer" style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", textDecoration: "none" }}>GitHub</a>
                    <a href={member.twitter} target="_blank" rel="noreferrer" style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", textDecoration: "none" }}>Twitter</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DiscoveryEngine category="general" currentPath="/about" />

      </main>
      <Footer />
    </div>
  );
}
