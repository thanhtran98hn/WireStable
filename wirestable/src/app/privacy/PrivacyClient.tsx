"use client";

import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DiscoveryEngine } from "@/components/DiscoveryEngine";
import { Footer } from "@/components/Footer";
import { HomeIcon } from "@/components/icons/CustomIcons";

export default function PrivacyPage() {
  return (
    <div className="app-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Navbar>
        <a href="/" className="btn btn-secondary btn-sm" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}><HomeIcon size={12} className="text-[var(--color-primary)]" /> Landing Page</a>
      </Navbar>
      
      <main className="app-main w-full max-w-[800px] mx-auto px-4 py-6" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", flex: 1 }}>
        <Breadcrumbs items={[{ label: "Privacy", url: "/privacy" }]} />
        
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Privacy Policy</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", marginTop: "6px" }}>Last updated: June 21, 2026</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "20px", lineHeight: 1.6 }}>
            <p>
              WireStable respects your privacy and is committed to protecting the personal data of our users. This policy outlines how we collect, store, and process your information when you interact with our natural-language remittance system, Developer-Controlled smart wallets, and APIs.
            </p>
            
            <h3 style={{ fontSize: "1.125rem", color: "var(--color-text-primary)", marginTop: "10px" }}>1. Information We Collect</h3>
            <p>
              We collect minimal information necessary to execute remittances and maintain AML/CFT compliance. This includes:
            </p>
            <ul style={{ paddingLeft: "20px" }}>
              <li><strong>User Identification Data</strong>: Hash of your email address (used to securely initialize your Circle User-Controlled Smart Wallet).</li>
              <li><strong>Conversational Contexts</strong>: Input prompts (text or voice transcripts) sent to our AI agent to parse intent.</li>
              <li><strong>On-Chain Metadata</strong>: Blockchain transaction hashes, public smart contract addresses, and token values transferred.</li>
            </ul>

            <h3 style={{ fontSize: "1.125rem", color: "var(--color-text-primary)", marginTop: "10px" }}>2. How We Use Information</h3>
            <p>
              We process data solely to provide the services described. We do not sell or rent user details. Data is utilized for:
            </p>
            <ul style={{ paddingLeft: "20px" }}>
              <li>Initializing and querying wallets on Circle Web3 Services.</li>
              <li>Resolving remittance intents into correct smart contract variables.</li>
              <li>Running compliance scoring to prevent illicit transactions.</li>
            </ul>
          </div>
        </div>

        <DiscoveryEngine category="legal" currentPath="/privacy" />
      </main>
      <Footer />
    </div>
  );
}
