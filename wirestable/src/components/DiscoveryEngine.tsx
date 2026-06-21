"use client";

import Link from "next/link";

interface DiscoveryItem {
  title: string;
  description: string;
  href: string;
  icon: string;
  tag?: string;
}

interface DiscoveryEngineProps {
  category?: "general" | "developer" | "legal" | "support";
  currentPath: string;
}

export function DiscoveryEngine({ category, currentPath }: DiscoveryEngineProps) {
  // Determine contextual related content & recommendations
  let relatedItems: DiscoveryItem[] = [];
  let ctaTitle = "Ready to experience gasless stablecoin payments?";
  let ctaSubtitle = "Onboard with your email in seconds, run mock payments, or integrate our stablecoin remittance stack.";
  let primaryCta = { label: "Launch Chat Remit ⚡", href: "/chat" };
  let secondaryCta = { label: "Agent Studio Sandbox 🧪", href: "/agent-studio" };

  if (currentPath.includes("/docs")) {
    relatedItems = [
      {
        title: "Frequently Asked Questions",
        description: "Got questions on Smart Wallets, Paymasters, or network security? Read the FAQ.",
        href: "/faq",
        icon: "💡",
        tag: "FAQ"
      },
      {
        title: "Meet the Team",
        description: "Read about our hackathon mission to make programmable stablecoins human-friendly.",
        href: "/about",
        icon: "🧠",
        tag: "ABOUT"
      },
      {
        title: "Contact Engineering Desk",
        description: "Need help with custom enterprise payouts? Speak directly with our developers.",
        href: "/contact",
        icon: "✉️",
        tag: "SUPPORT"
      }
    ];
    ctaTitle = "Build your own Stablecoin Commerce workflows";
    ctaSubtitle = "Review EIP-7708 gasless bundlers, compliance check loops, and Circle MPC wallet setups.";
    primaryCta = { label: "Launch Chat Sandbox ⚡", href: "/chat" };
    secondaryCta = { label: "Agent Sandbox 🧪", href: "/agent-studio" };
  } else if (currentPath.includes("/faq")) {
    relatedItems = [
      {
        title: "Developer Integration Docs",
        description: "Review implementation parameters, code scripts, and paymaster code snippets.",
        href: "/docs",
        icon: "📖",
        tag: "DOCS"
      },
      {
        title: "Meet the Team",
        description: "Read about our hackathon mission to make programmable stablecoins human-friendly.",
        href: "/about",
        icon: "🧠",
        tag: "ABOUT"
      },
      {
        title: "Contact Desk",
        description: "Need custom partnership integrations? Get in touch with our team.",
        href: "/contact",
        icon: "✉️",
        tag: "SUPPORT"
      }
    ];
    ctaTitle = "Run live transaction tests in the sandbox";
    ctaSubtitle = "Experience instantaneous settlement speeds on the Arc network using our live chat interface.";
    primaryCta = { label: "Launch Chat App ⚡", href: "/chat" };
    secondaryCta = { label: "Agent Sandbox 🧪", href: "/agent-studio" };
  } else if (currentPath.includes("/about") || currentPath.includes("/contact")) {
    relatedItems = [
      {
        title: "Read our FAQ",
        description: "Find instant answers about security compliance and supported stablecoins.",
        href: "/faq",
        icon: "💡",
        tag: "FAQ"
      },
      {
        title: "Developer Integration Docs",
        description: "Review implementation parameters, code scripts, and paymaster code snippets.",
        href: "/docs",
        icon: "📖",
        tag: "DOCS"
      },
      {
        title: "Privacy Agreement",
        description: "Understand how we protect email hashes, audit logs, and on-chain telemetry.",
        href: "/privacy",
        icon: "🔒",
        tag: "LEGAL"
      }
    ];
    ctaTitle = "Experience gasless conversational payments";
    ctaSubtitle = "Execute secure corporate disbursals, sweep yields, or lock corridor hedging using natural language.";
    primaryCta = { label: "Launch Chat Remit ⚡", href: "/chat" };
    secondaryCta = { label: "Agent Sandbox 🧪", href: "/agent-studio" };
  } else if (currentPath.includes("/privacy") || currentPath.includes("/terms")) {
    relatedItems = [
      {
        title: "Smart Wallet FAQ",
        description: "Learn how MPC key fragments and hardware enclaves protect user balances.",
        href: "/faq",
        icon: "💡",
        tag: "FAQ"
      },
      {
        title: "Contact Legal Support",
        description: "Have compliance or data custody questions? Send a direct message to our support desk.",
        href: "/contact",
        icon: "✉️",
        tag: "SUPPORT"
      },
      {
        title: "Developer Docs",
        description: "Review our smart wallet SDK implementations and open-source packages.",
        href: "/docs",
        icon: "📖",
        tag: "DOCS"
      }
    ];
    ctaTitle = "Have custom compliance or custody questions?";
    ctaSubtitle = "We support customized Maker-Checker rosters, automated yield schedules, and private RPC integrations.";
    primaryCta = { label: "Speak with Engineers ✉️", href: "/contact" };
    secondaryCta = { label: "Developer Docs 📖", href: "/docs" };
  } else {
    // Default fallback
    relatedItems = [
      {
        title: "Developer Integration Docs",
        description: "Review implementation parameters, code scripts, and paymaster code snippets.",
        href: "/docs",
        icon: "📖",
        tag: "DOCS"
      },
      {
        title: "Read our FAQ",
        description: "Find instant answers about security compliance and supported stablecoins.",
        href: "/faq",
        icon: "💡",
        tag: "FAQ"
      },
      {
        title: "Meet the Team",
        description: "Read about our hackathon mission to make programmable stablecoins human-friendly.",
        href: "/about",
        icon: "🧠",
        tag: "ABOUT"
      }
    ];
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", width: "100%" }}>
      {/* Contextual Recommendation Grid */}
      {relatedItems.length > 0 && (
        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-6)" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, marginBottom: "16px", color: "var(--color-text-primary)" }}>
            Explore Related Resources
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            {relatedItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className="discovery-card card"
                style={{ 
                  display: "flex", 
                  flexDirection: "column",
                  gap: "12px", 
                  padding: "20px", 
                  textDecoration: "none", 
                  color: "inherit",
                  height: "100%",
                  transition: "border-color 0.2s ease, transform 0.2s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ 
                    fontSize: "1.5rem", 
                    background: "var(--color-bg-secondary)", 
                    width: "42px", 
                    height: "42px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)"
                  }}>
                    {item.icon}
                  </div>
                  {item.tag && (
                    <span style={{ 
                      fontSize: "0.625rem", 
                      fontWeight: 700, 
                      letterSpacing: "0.05em",
                      background: "rgba(255, 107, 74, 0.1)",
                      color: "var(--color-primary)",
                      padding: "4px 8px",
                      borderRadius: "12px"
                    }}>
                      {item.tag}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                  <strong style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>{item.title}</strong>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.4, margin: 0 }}>
                    {item.description}
                  </p>
                </div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary)", marginTop: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                  Learn More <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Modern Contextual Call to Action */}
      <section 
        className="cta-section card" 
        style={{ 
          textAlign: "center", 
          padding: "var(--space-6) var(--space-5)", 
          background: "linear-gradient(135deg, rgba(255, 107, 74, 0.05) 0%, rgba(12, 14, 24, 0.8) 100%)",
          border: "1px dashed var(--color-primary)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px"
        }}
      >
        <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--color-text-primary)", margin: 0 }}>
          {ctaTitle}
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", maxWidth: "580px", lineHeight: 1.5, margin: 0 }}>
          {ctaSubtitle}
        </p>
        
        <div 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "12px", 
            width: "100%", 
            justifyContent: "center",
            marginTop: "4px"
          }} 
          className="sm:flex-row"
        >
          <Link 
            href={primaryCta.href} 
            className="btn btn-primary" 
            style={{ textDecoration: "none", padding: "10px 20px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          >
            {primaryCta.label}
          </Link>
          <Link 
            href={secondaryCta.href} 
            className="btn btn-secondary" 
            style={{ textDecoration: "none", padding: "10px 20px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          >
            {secondaryCta.label}
          </Link>
        </div>
      </section>

      <style jsx global>{`
        .discovery-card:hover {
          border-color: var(--color-primary) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
