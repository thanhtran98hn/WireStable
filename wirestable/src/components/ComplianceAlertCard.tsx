"use client";

import React, { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { SarPdfReport } from "./SarPdfReport";

interface ComplianceAlertCardProps {
  recipientAddress: string;
  amount: string;
  asset: string;
  riskScore: number;
  reason: string;
  senderAddress: string;
  senderEmail: string;
  timestamp?: string;
}

export function ComplianceAlertCard({
  recipientAddress,
  amount,
  asset,
  riskScore,
  reason,
  senderAddress,
  senderEmail,
  timestamp = new Date().toISOString(),
}: ComplianceAlertCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const reportId = Math.floor(100000 + Math.random() * 900000).toString();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      className="compliance-alert-card"
      style={{
        background: "rgba(239, 68, 68, 0.05)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        borderRadius: "var(--radius-lg, 12px)",
        padding: "var(--space-4, 16px)",
        maxWidth: "460px",
        margin: "12px 0",
        color: "var(--color-text-primary, #1f2937)",
        fontFamily: "var(--font-sans, system-ui)",
        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "1.25rem" }}>🚨</span>
        <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "rgb(220, 38, 38)" }}>
          Compliance & Security Block
        </h4>
      </div>

      <p style={{ margin: 0, fontSize: "0.8125rem", lineHeight: 1.4, color: "var(--color-text-secondary, #4b5563)" }}>
        Our automated compliance intelligence engine (UAE FIU Sandbox Compliant) flagged this transaction as violating anti-money laundering (AML) or sanctions policies.
      </p>

      <div
        style={{
          background: "rgba(220, 38, 38, 0.08)",
          borderRadius: "8px",
          padding: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px dashed rgba(220, 38, 38, 0.2)"
        }}
      >
        <div>
          <span style={{ fontSize: "0.6875rem", color: "rgb(153, 27, 27)", fontWeight: 600, display: "block", textTransform: "uppercase" }}>
            AML Risk Score
          </span>
          <strong style={{ fontSize: "1.25rem", color: "rgb(185, 28, 28)", fontWeight: 800 }}>
            {riskScore} / 100
          </strong>
        </div>
        <div
          style={{
            background: "rgb(220, 38, 38)",
            color: "#ffffff",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "0.6875rem",
            fontWeight: 700
          }}
        >
          BLOCKED
        </div>
      </div>

      <div style={{ fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--color-text-secondary, #6b7280)" }}>Flagged Target:</span>
          <span style={{ fontFamily: "monospace", color: "var(--color-text-primary)" }}>
            {recipientAddress.slice(0, 8)}...{recipientAddress.slice(-6)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--color-text-secondary, #6b7280)" }}>Intended Value:</span>
          <strong style={{ color: "var(--color-text-primary)" }}>
            {amount} {asset}
          </strong>
        </div>
        <div style={{ marginTop: "4px" }}>
          <span style={{ color: "var(--color-text-secondary, #6b7280)", display: "block", fontWeight: 600 }}>Reason:</span>
          <span style={{ color: "rgb(153, 27, 27)", fontStyle: "italic", fontSize: "0.725rem", display: "block", marginTop: "2px" }}>
            {reason}
          </span>
        </div>
      </div>

      {isMounted ? (
        <PDFDownloadLink
          document={
            <SarPdfReport
              reportId={reportId}
              senderAddress={senderAddress}
              senderEmail={senderEmail}
              recipientAddress={recipientAddress}
              amount={amount}
              asset={asset}
              riskScore={riskScore}
              reason={reason}
              timestamp={timestamp}
            />
          }
          fileName={`WireStable_Compliance_Report_SAR_${reportId}.pdf`}
          style={{ textDecoration: "none" }}
        >
          {({ loading: pdfLoading }) => (
            <button
              disabled={pdfLoading}
              className="btn"
              style={{
                width: "100%",
                background: "rgb(220, 38, 38)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "background 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgb(185, 28, 28)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgb(220, 38, 38)"}
            >
              {pdfLoading ? "Generating PDF..." : "📥 Download Signed SAR Audit PDF"}
            </button>
          )}
        </PDFDownloadLink>
      ) : (
        <button
          className="btn"
          style={{
            width: "100%",
            background: "rgba(220, 38, 38, 0.4)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "not-allowed"
          }}
          disabled
        >
          Loading Report PDF...
        </button>
      )}
    </div>
  );
}
