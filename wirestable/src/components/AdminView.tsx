"use client";

import { useState } from "react";
import { useCorporateAdmin } from "@/hooks/useCorporateAdmin";
import { YieldAnalytics } from "@/components/YieldAnalytics";
import { LPAnalytics } from "@/components/LPAnalytics";
import { Navbar } from "@/components/Navbar";

export function AdminView() {
  const {
    wallet,
    batches,
    isLoading,
    error,
    autoSweep,
    usycBalance,
    accruedYield,
    initializeTreasuryWallet,
    submitBatch,
    approveBatch,
    rejectBatch,
    toggleAutoSweep,
    parseCSV
  } = useCorporateAdmin();

  const [csvInput, setCsvInput] = useState<string>("");
  const [tokenChoice, setTokenChoice] = useState<"USDC" | "EURC">("USDC");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);

  // Load sample CSV payroll
  const loadSampleCSV = () => {
    const sample = `recipientName,address,amount
Alice (Lead Dev),0xa2b22b2b22b2b2b22b2b2b22b2b2b22b2b2b2b,250.00
Bob (UI Designer),0x73977c088ddf7324317f2ccb2b2b1a134c6dbca8,180.00
Charlie (Copywriter),0x5c79743c39385fb93c0d8df3c9ee5ff27fbc32a1,95.50`;
    setCsvInput(sample);
    const parsed = parseCSV(sample);
    setParsedPreview(parsed);
  };

  const handleCsvChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCsvInput(value);
    const parsed = parseCSV(value);
    setParsedPreview(parsed);
  };

  // CSV File Uploader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvInput(text);
      const parsed = parseCSV(text);
      setParsedPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
 
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvInput(text);
        const parsed = parseCSV(text);
        setParsedPreview(parsed);
      };
      reader.readAsText(file);
    }
  };

  // Submit batch (Maker Step)
  const handleSubmitBatch = async () => {
    if (parsedPreview.length === 0) return;
    const batch = await submitBatch(parsedPreview, tokenChoice);
    if (batch) {
      setCsvInput("");
      setParsedPreview([]);
    }
  };

  return (
    <div className="app-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Navbar>
        <a
          href="/agent-studio"
          className="btn btn-secondary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", fontSize: "11px", fontWeight: "bold", padding: "6px 12px", borderRadius: "8px" }}
        >
          ⚡ Agent Studio
        </a>
        <a
          href="/chat"
          className="btn btn-secondary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", fontSize: "11px", fontWeight: "bold", padding: "6px 12px", borderRadius: "8px" }}
        >
          💬 Chat Interface
        </a>
      </Navbar>

      {/* Main Admin Area */}
      <main className="app-main admin-dashboard-layout" style={{ flex: 1 }}>
        
        {/* Left Side: Treasury Metrics & Yield Sweep */}
        <section style={{ flex: "1 1 420px", display: "flex", flexDirection: "column", gap: "var(--space-4)", minWidth: 0 }}>
          <div className="card" style={{ padding: "var(--space-5)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "var(--space-2)", color: "var(--color-text-primary)" }}>
              Treasury Wallet Set
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginBottom: "var(--space-4)", lineHeight: 1.4 }}>
              Managed securely via Circle Developer-Controlled wallets on Arc Testnet for multi-party authorization.
            </p>

            {wallet && wallet.created ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div>
                  <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-tertiary)" }}>
                    Wallet Set ID
                  </span>
                  <div className="text-mono" style={{ fontSize: "0.75rem", background: "var(--color-bg-secondary)", padding: "6px 10px", borderRadius: "6px", marginTop: "4px" }}>
                    {wallet.walletSetId}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-tertiary)" }}>
                    Arc Wallet Address
                  </span>
                  <div
                    className="text-mono"
                    style={{ fontSize: "0.75rem", background: "var(--color-bg-secondary)", padding: "6px 10px", borderRadius: "6px", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <span>{wallet.address.slice(0, 14)}...{wallet.address.slice(-10)}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(wallet.address)}
                      style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.75rem" }}
                      title="Copy Address"
                    >
                      📋
                    </button>
                  </div>
                </div>

                {/* Balances */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                  <div style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.1)", borderRadius: "var(--radius-md)", padding: "var(--space-3)" }}>
                    <div style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>USDC Balance</div>
                    <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-primary)", marginTop: "4px" }}>
                      {parseFloat(wallet.usdcBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.1)", borderRadius: "var(--radius-md)", padding: "var(--space-3)" }}>
                    <div style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>EURC Balance</div>
                    <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-success)", marginTop: "4px" }}>
                      {parseFloat(wallet.eurcBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.6875rem", color: "var(--color-success)", marginTop: "4px" }}>
                  <span style={{ height: "6px", width: "6px", borderRadius: "50%", background: "var(--color-success)" }} />
                  Developer-Controlled Wallet Synced
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
                <div style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>🔑</div>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
                  No corporate treasury wallet is currently active.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={initializeTreasuryWallet}
                  disabled={isLoading}
                  style={{ width: "100%" }}
                >
                  {isLoading ? "Generating..." : "Generate Master Treasury Wallet"}
                </button>
              </div>
            )}
          </div>

          {/* Yield Sweeping Section */}
          {wallet && wallet.created && (
            <YieldAnalytics
              autoSweep={autoSweep}
              usycBalance={usycBalance}
              accruedYield={accruedYield}
              onToggleSweep={toggleAutoSweep}
              isUpdating={isLoading}
            />
          )}

          {/* LP reserves & FX Hedging Section */}
          {wallet && wallet.created && <LPAnalytics />}
        </section>

        {/* Right Side: CSV Payroll Uploader + Maker/Checker Panel */}
        <section style={{ flex: "2 1 500px", display: "flex", flexDirection: "column", gap: "var(--space-5)", minWidth: 0 }}>
          
          {/* Uploader Card */}
          <div className="card" style={{ padding: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Initiate Batch Disbursals (Maker Step)</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={loadSampleCSV}
                style={{ fontSize: "0.6875rem", padding: "4px 8px" }}
              >
                📝 Load Sample CSV Payroll
              </button>
            </div>

            {/* Token Selector */}
            <div style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-4)", alignItems: "center" }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>Disbursal Token:</span>
              <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8125rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="token"
                  checked={tokenChoice === "USDC"}
                  onChange={() => setTokenChoice("USDC")}
                />
                USDC
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8125rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="token"
                  checked={tokenChoice === "EURC"}
                  onChange={() => setTokenChoice("EURC")}
                />
                EURC
              </label>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                border: dragActive ? "2px dashed var(--color-primary)" : "2px dashed var(--color-border)",
                background: dragActive ? "rgba(59, 130, 246, 0.05)" : "var(--color-bg-secondary)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-4)",
                textAlign: "center",
                cursor: "pointer",
                position: "relative",
                marginBottom: "var(--space-4)"
              }}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer"
                }}
              />
              <span style={{ fontSize: "1.5rem" }}>📁</span>
              <p style={{ fontSize: "0.8125rem", marginTop: "6px", color: "var(--color-text-secondary)" }}>
                Drag and drop a <strong>.csv</strong> file here, or click to upload.
              </p>
              <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
                Format: name, address, amount
              </span>
            </div>

            {/* CSV Textarea Input */}
            <div style={{ marginBottom: "var(--space-4)" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                Or paste CSV contents below:
              </span>
              <textarea
                value={csvInput}
                onChange={handleCsvChange}
                placeholder="recipientName,address,amount&#10;Alice,0x...,150.00&#10;Bob,0x...,200.00"
                style={{
                  width: "100%",
                  height: "120px",
                  background: "var(--color-bg-secondary)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "var(--space-3)",
                  fontSize: "0.8125rem",
                  fontFamily: "monospace",
                  marginTop: "6px"
                }}
              />
            </div>

            {/* Parsed Preview */}
            {parsedPreview.length > 0 && (
              <div style={{ marginBottom: "var(--space-4)" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                  Parsed Payroll Preview ({parsedPreview.length} recipients):
                </span>
                <div style={{ maxHeight: "150px", overflow: "auto", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", marginTop: "6px" }}>
                  <table style={{ width: "100%", minWidth: "580px", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
                    <thead style={{ background: "var(--color-bg-secondary)", color: "var(--color-text-secondary)" }}>
                      <tr>
                        <th style={{ padding: "8px" }}>Name</th>
                        <th style={{ padding: "8px" }}>Address</th>
                        <th style={{ padding: "8px" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedPreview.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <td style={{ padding: "8px" }}>{item.recipientName}</td>
                          <td style={{ padding: "8px", fontFamily: "monospace" }}>{item.address.slice(0, 10)}...{item.address.slice(-6)}</td>
                          <td style={{ padding: "8px", fontWeight: 600 }}>{item.amount} {tokenChoice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary"
              disabled={parsedPreview.length === 0 || isLoading || !wallet?.created}
              onClick={handleSubmitBatch}
              style={{ width: "100%" }}
            >
              {isLoading ? "Submitting..." : !wallet?.created ? "Generate Wallet Set First" : "📤 Submit Payout Batch for Approval"}
            </button>
          </div>

          {/* Batches and Checker panel */}
          <div className="card" style={{ padding: "var(--space-5)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "var(--space-4)" }}>
              Maker-Checker Authorization & Monitoring
            </h3>

            {batches.length === 0 ? (
              <div style={{ textAlign: "center", padding: "var(--space-5) 0", color: "var(--color-text-tertiary)", fontSize: "0.8125rem" }}>
                No payout batches submitted yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {batches.map((batch) => (
                  <div
                    key={batch.id}
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--space-4)",
                      background: batch.status === "pending_approval" ? "rgba(245, 158, 11, 0.04)" : "rgba(255, 255, 255, 0.02)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                      <div>
                        <span className="text-mono" style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
                          {batch.id}
                        </span>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600, marginTop: "2px" }}>
                          Total: {parseFloat(batch.totalAmount).toLocaleString()} {batch.token} ({batch.payouts.length} recipients)
                        </div>
                        {batch.redemptionNote && (
                          <div style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600, marginTop: "4px" }}>
                            💡 {batch.redemptionNote}
                          </div>
                        )}
                      </div>

                      <span
                        className={`status-badge ${
                          batch.status === "completed"
                            ? "status-badge-success"
                            : batch.status === "pending_approval"
                            ? "status-badge-pending"
                            : "status-badge-error"
                        }`}
                      >
                        {batch.status === "pending_approval" ? "Awaiting Checker" : batch.status === "completed" ? "Executed" : "Cancelled"}
                      </span>
                    </div>

                     {/* Batch Recipient Monitor */}
                    <div style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-sm)", padding: "var(--space-3)", maxHeight: "160px", overflow: "auto", marginBottom: "var(--space-3)" }}>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase" }}>
                        Live Disbursal Monitor
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                        {batch.payouts.map((p, idx) => (
                          <div key={idx} className="flex flex-wrap gap-2 justify-between items-center" style={{ fontSize: "0.75rem" }}>
                            <span>{p.recipientName} ({p.amount} {batch.token})</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              {p.txHash ? (
                                <a
                                  href={`https://testnet.arcscan.app/tx/${p.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "var(--color-primary)", textDecoration: "none", fontSize: "0.6875rem" }}
                                >
                                  Tx: {p.txHash.slice(0, 8)}...
                                </a>
                              ) : null}
                              <span style={{
                                color: p.status === "success" ? "var(--color-success)" : p.status === "pending" ? "var(--color-warning)" : "var(--color-error)"
                              }}>
                                {p.status === "success" ? "✓ Done" : p.status === "pending" ? "⏳ Awaiting Approval" : "✗ Reverted"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Checker Action Panel */}
                    {batch.status === "pending_approval" && (
                      <div style={{ display: "flex", gap: "var(--space-3)" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => rejectBatch(batch.id)}
                          style={{ flex: 1 }}
                        >
                          Reject Batch
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => approveBatch(batch.id)}
                          style={{ flex: 2 }}
                        >
                          ✅ Checker Approve & Disburse
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
