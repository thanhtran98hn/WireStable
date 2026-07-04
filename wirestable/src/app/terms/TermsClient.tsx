"use client";

import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DiscoveryEngine } from "@/components/DiscoveryEngine";
import { Footer } from "@/components/Footer";
import { HomeIcon } from "@/components/icons/CustomIcons";

export default function TermsPage() {
  return (
    <div className="app-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Navbar>
        <a href="/" className="btn btn-secondary btn-sm" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}><HomeIcon size={12} className="text-[var(--color-primary)]" /> Landing Page</a>
      </Navbar>
      
      <main className="app-main w-full max-w-[800px] mx-auto px-4 py-6" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", flex: 1 }}>
        <Breadcrumbs items={[{ label: "Terms of Service", url: "/terms" }]} />
        
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Terms of Service</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", marginTop: "6px" }}>Last updated: June 21, 2026</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "20px", lineHeight: 1.6 }}>
            <p>
              By accessing and using WireStable, you agree to comply with the terms and conditions outlined below.
            </p>
            
            <h3 style={{ fontSize: "1.125rem", color: "var(--color-text-primary)", marginTop: "10px" }}>1. non-custodial responsibility</h3>
            <p>
              WireStable provides user-friendly natural-language templates for the Circle Web3 Programmable Wallets SDK. You retain complete ownership of your wallet keys. We cannot recover lost credentials or private pins.
            </p>

            <h3 style={{ fontSize: "1.125rem", color: "var(--color-text-primary)", marginTop: "10px" }}>2. Compliance & AML Scoring</h3>
            <p>
              To ensure compliance with global regulations, all addresses are scanned by an automated compliance API before transaction execution. WireStable reserves the right to reject inputs that yield a high AML risk score.
            </p>

            <h3 style={{ fontSize: "1.125rem", color: "var(--color-text-primary)", marginTop: "10px" }}>3. Network and Asset Value</h3>
            <p>
              All transactions executed on WireStable operate on the Arc Testnet using testnet assets (e.g. Arc Testnet USDC) which carry no real-world monetary value. WireStable is not liable for transactions conducted on these test networks.
            </p>
          </div>
        </div>

        <DiscoveryEngine category="legal" currentPath="/terms" />
      </main>
      <Footer />
    </div>
  );
}
