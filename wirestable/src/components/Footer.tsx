import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        background: "rgba(5, 6, 11, 0.95)",
        padding: "48px 24px 32px 24px",
        marginTop: "auto",
        fontSize: "0.875rem",
        color: "var(--color-text-secondary)"
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "32px",
          marginBottom: "40px"
        }}
      >
        {/* Branding Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", color: "var(--color-text-primary)" }}>
            <span style={{ background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-light) 100%)", color: "var(--color-text-inverse)", width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>W$</span>
            <span>WireStable</span>
          </div>
          <p style={{ fontSize: "0.75rem", lineHeight: 1.5, margin: 0, color: "var(--color-text-tertiary)" }}>
            Conversational Stablecoin Remittances & Yield stack powered by Circle Web3 App Kit and Arc Chain.
          </p>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
            © {new Date().getFullYear()} WireStable. All rights reserved.
          </span>
        </div>

        {/* Product Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <strong style={{ color: "var(--color-text-primary)", fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Product</strong>
          <Link href="/chat" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Remit Chat 💬</Link>
          <Link href="/admin" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Treasury Hub 🏢</Link>
          <Link href="/agent-studio" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Agent Studio 🧪</Link>
        </div>

        {/* Resources Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <strong style={{ color: "var(--color-text-primary)", fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Resources</strong>
          <Link href="/docs" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Developer Docs 📖</Link>
          <Link href="/faq" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">FAQ & Guide ❓</Link>
          <Link href="/about" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">About Team 🏢</Link>
          <Link href="/contact" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Support Contact ✉️</Link>
        </div>

        {/* Safety Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <strong style={{ color: "var(--color-text-primary)", fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Safety & Legal</strong>
          <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Privacy Policy 🔒</Link>
          <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-primary)]">Terms of Service 📄</Link>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.6875rem", color: "var(--color-success)", marginTop: "4px" }}>
            <span style={{ height: "6px", width: "6px", borderRadius: "50%", background: "var(--color-success)" }} />
            Arc Testnet Status: Active
          </div>
        </div>
      </div>
    </footer>
  );
}
