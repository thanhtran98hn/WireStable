"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedContent } from "@/components/RelatedContent";
import { CTASection } from "@/components/CTASection";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    // Simulate sending contact message
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 1000);
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

      {/* Visual Breadcrumb navigation */}
      <div style={{ maxWidth: "960px", margin: "0 auto", width: "100%", padding: "var(--space-6) var(--space-4) 0 var(--space-4)" }}>
        <Breadcrumbs />
      </div>

      {/* Grid Layout */}
      <main className="app-main grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[960px] mx-auto px-4 py-6" style={{ flex: 1 }}>
        
        {/* Support channels info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Get in Touch</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "10px", lineHeight: 1.6 }}>
              Whether you are an enterprise treasury administrator looking to sponsor transactions, a builder looking to integrate our API, or a hackathon judge wanting to review the protocol mechanics, we are here to help.
            </p>
          </div>

          <div className="card" style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "1.125rem" }}>Alternative Channels</h3>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.25rem" }}>💬</span>
              <div>
                <strong style={{ fontSize: "0.875rem", display: "block" }}>Telegram Support</strong>
                <a href="https://t.me" target="_blank" rel="noreferrer" style={{ fontSize: "0.8125rem", color: "var(--color-primary)", textDecoration: "none" }}>t.me/wirestable_remit</a>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.25rem" }}>🐙</span>
              <div>
                <strong style={{ fontSize: "0.875rem", display: "block" }}>GitHub Repository</strong>
                <a href="https://github.com" target="_blank" rel="noreferrer" style={{ fontSize: "0.8125rem", color: "var(--color-primary)", textDecoration: "none" }}>github.com/wirestable/remittance-stack</a>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.25rem" }}>🐦</span>
              <div>
                <strong style={{ fontSize: "0.875rem", display: "block" }}>X / Twitter</strong>
                <a href="https://x.com" target="_blank" rel="noreferrer" style={{ fontSize: "0.8125rem", color: "var(--color-primary)", textDecoration: "none" }}>@WireStable</a>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <h3 style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Send us a message</h3>
          
          {success && (
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgb(16,185,129)", color: "rgb(16,185,129)", padding: "12px", borderRadius: "8px", fontSize: "0.875rem", marginBottom: "16px" }}>
              ✓ Message sent successfully! Our team will respond within 24 hours.
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgb(239,68,68)", color: "rgb(239,68,68)", padding: "12px", borderRadius: "8px", fontSize: "0.875rem", marginBottom: "16px" }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-tertiary)", fontWeight: 700, display: "block", marginBottom: "6px" }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                style={{ width: "100%", padding: "10px", background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)", borderRadius: "6px", color: "var(--color-text-primary)", fontSize: "0.875rem" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-tertiary)", fontWeight: 700, display: "block", marginBottom: "6px" }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{ width: "100%", padding: "10px", background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)", borderRadius: "6px", color: "var(--color-text-primary)", fontSize: "0.875rem" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-tertiary)", fontWeight: 700, display: "block", marginBottom: "6px" }}>Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ width: "100%", padding: "10px", background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)", borderRadius: "6px", color: "var(--color-text-primary)", fontSize: "0.875rem" }}
              >
                <option value="general">General Inquiry</option>
                <option value="api">API / Partnership</option>
                <option value="bug">Report a bug</option>
                <option value="custom">Custom integration</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-tertiary)", fontWeight: 700, display: "block", marginBottom: "6px" }}>Your Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="How can we help you?"
                style={{ width: "100%", padding: "10px", background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)", borderRadius: "6px", color: "var(--color-text-primary)", fontSize: "0.875rem", resize: "none" }}
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", fontWeight: "bold" }}>
              {isSubmitting ? "Sending..." : "Submit Inquiry ✉️"}
            </button>
          </form>
        </div>

      </main>

      {/* Linking & Discovery modules */}
      <div style={{ maxWidth: "960px", margin: "0 auto", width: "100%", padding: "0 var(--space-4) 80px var(--space-4)" }}>
        <RelatedContent />
        <CTASection />
      </div>

    </div>
  );
}

