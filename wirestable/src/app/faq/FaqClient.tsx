"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedContent } from "@/components/RelatedContent";
import { CTASection } from "@/components/CTASection";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: "General",
      question: "What is WireStable?",
      answer: "WireStable is an AI-first stablecoin remittance platform that enables businesses and individuals to sweep idle treasury assets, stream micro-payments, and execute cross-border payouts using simple natural language."
    },
    {
      category: "General",
      question: "How does natural language remittance work?",
      answer: "Our built-in AI parser handles commands like 'transfer 10 USDC to Bob and convert remaining balance to EURC'. It maps entities to public addresses, calculates conversion rates, and sponsors transactions gaslessly."
    },
    {
      category: "Security",
      question: "Is my corporate treasury balance secure?",
      answer: "Absolutely. WireStable utilizes Circle Developer-Controlled Wallets with multi-party computation (MPC) and strict Maker-Checker approval rules. No single agent can execute transfers without owner signature authorization."
    },
    {
      category: "Network",
      question: "Which blockchains are supported?",
      answer: "We primarily support the Arc Testnet where USDC is the native gas asset, as well as EVM chains (Sepolia) utilizing Circle’s Cross-Chain Transfer Protocol (CCTP) to bridge tokens back and forth instantly."
    },
    {
      category: "Pricing",
      question: "How are transfers completely gasless for the user?",
      answer: "We leverage the native stablecoin transaction sponsorship capabilities of the Arc Chain. When you request a payout, our backend Paymaster API wraps the transfer under ERC-7708 criteria, paying the necessary gas in stablecoins on behalf of the user, abstracting gas tokens completely."
    },
    {
      question: "Is my Circle Smart Wallet secure?",
      answer: "Yes. We deploy Circle User-Controlled Smart Contract Accounts (SCA) secured via multi-party computation (MPC) and hardware enclaves. Your signature is required to execute transfers. The AI remittance agent only acts as a Maker (drafting intents) while your cryptographic wallet acts as the Checker.",
      category: "Security"
    },
    {
      question: "How do Maker-Checker roles work in WireStable?",
      answer: "Corporate accounts can configure Maker rules (e.g. payout queues initiated by team members or yield sweeps triggered by smart agents) which remain in 'pending_approval' status. These batches only execute once a authorized Checker wallet registers a valid cryptographic sign-off on the Arc chain.",
      category: "Security"
    },
    {
      question: "What stablecoins are supported?",
      answer: "We support USD Coin (USDC) and Eurite (EURC) on EVM networks, with instant cross-chain bridging via Circle's CCTP. Conversions between USDC and EURC utilize real-time option corridor rate locks.",
      category: "Assets"
    }
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Navbar>
        <a href="/" className="btn btn-secondary btn-sm" style={{ textDecoration: "none", fontSize: "11px", fontWeight: "bold" }}>
          🏠 Landing Page
        </a>
        <a href="/chat" className="btn btn-primary btn-sm" style={{ textDecoration: "none", fontSize: "11px", fontWeight: "bold" }}>
          Launch App ⚡
        </a>
      </Navbar>

      {/* FAQ Main */}
      <main className="app-main w-full max-w-[800px] mx-auto px-4 py-6" style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)", flex: 1, paddingBottom: "100px" }}>
        
        {/* Dynamic Breadcrumbs */}
        <Breadcrumbs />

        {/* Search */}
        <div className="card" style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Frequently Asked Questions</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            Have questions about gasless remittances, AML compliance scores, or Circle Smart Wallets? Search below:
          </p>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. security, gas, circle)"
            style={{
              width: "100%",
              background: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              color: "var(--color-text-primary)",
              fontSize: "0.875rem",
              marginTop: "8px"
            }}
          />
        </div>

        {/* Accordion List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  padding: "var(--space-4)",
                  cursor: "pointer",
                  borderColor: expandedIndex === idx ? "var(--color-primary)" : "var(--color-border)",
                  transition: "all 0.2s ease"
                }}
                onClick={() => toggleExpand(idx)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(255,107,74,0.1)",
                        color: "var(--color-primary)",
                        fontWeight: 700
                      }}
                    >
                      {faq.category}
                    </span>
                    <strong style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>{faq.question}</strong>
                  </div>
                  <span style={{ fontSize: "1.25rem", color: "var(--color-text-tertiary)" }}>
                    {expandedIndex === idx ? "−" : "+"}
                  </span>
                </div>

                {expandedIndex === idx && (
                  <p
                    style={{
                      marginTop: "12px",
                      fontSize: "0.875rem",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.6,
                      borderTop: "1px solid var(--color-border)",
                      paddingTop: "12px"
                    }}
                  >
                    {faq.answer}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="card" style={{ padding: "var(--space-5)", textAlign: "center" }}>
              <span style={{ color: "var(--color-text-tertiary)" }}>No questions matched your search criteria.</span>
            </div>
          )}
        </div>

        {/* Discovery & Navigation Links */}
        <RelatedContent />
        <CTASection />

      </main>
    </div>
  );
}

