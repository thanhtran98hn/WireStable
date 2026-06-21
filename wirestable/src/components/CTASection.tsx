"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function CTASection() {
  const pathname = usePathname() || "";
  
  // Decide CTA contents based on route
  let title = "Ready to experience gasless stablecoin payments?";
  let subtitle = "Onboard with your email in seconds, run mock payments, or integrate our stablecoin remittance stack.";
  let primaryLabel = "Launch Chat Remit ⚡";
  let primaryHref = "/chat";
  let secondaryLabel = "Agent Studio Developer Portal 🧪";
  let secondaryHref = "/agent-studio";

  if (pathname.includes("/chat") || pathname.includes("/admin") || pathname.includes("/agent-studio")) {
    // Inside the app, prompt docs or contact support
    title = "Build your own Stablecoin Commerce workflows";
    subtitle = "Deploy custom Maker-Checker rules, monitor compliance APIs, or configure options hedging using our developer SDK.";
    primaryLabel = "Developer Docs 📖";
    primaryHref = "/docs";
    secondaryLabel = "Get Technical Support ✉️";
    secondaryHref = "/contact";
  } else if (pathname.includes("/privacy") || pathname.includes("/terms")) {
    // Legal page recovery paths
    title = "Have questions about compliance or key enclaves?";
    subtitle = "Read our security FAQ to learn how developer-controlled and user-controlled MPC smart contract wallets operate.";
    primaryLabel = "Read Security FAQ 💡";
    primaryHref = "/faq";
    secondaryLabel = "Contact Legal & Compliance ✉️";
    secondaryHref = "/contact";
  }

  return (
    <section 
      className="cta-section card" 
      style={{ 
        textAlign: "center", 
        padding: "var(--space-6) var(--space-5)", 
        marginTop: "var(--space-6)",
        marginBottom: "var(--space-5)",
        background: "linear-gradient(135deg, rgba(255, 107, 74, 0.05) 0%, rgba(12, 14, 24, 0.8) 100%)",
        border: "1px dashed var(--color-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px"
      }}
    >
      <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--color-text-primary)", margin: 0 }}>
        {title}
      </h3>
      <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", maxWidth: "580px", lineHeight: 1.5, margin: 0 }}>
        {subtitle}
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
          href={primaryHref} 
          className="btn btn-primary" 
          style={{ textDecoration: "none", padding: "10px 20px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          {primaryLabel}
        </Link>
        <Link 
          href={secondaryHref} 
          className="btn btn-secondary" 
          style={{ textDecoration: "none", padding: "10px 20px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          {secondaryLabel}
        </Link>
      </div>
    </section>
  );
}
