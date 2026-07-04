"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Masking helpers to encrypt/protect PII in regulatory exports
export function maskAddress(address: string): string {
  if (!address || address.length < 10) return "0x***";
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***.***";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `*@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#1e3a8a",
    paddingBottom: 10,
    marginBottom: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3a8a",
  },
  headerSub: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
  },
  docTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
    color: "#111827",
    textDecoration: "underline",
  },
  section: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 3,
  },
  label: {
    fontSize: 9,
    color: "#4b5563",
    fontWeight: "bold",
  },
  value: {
    fontSize: 9,
    color: "#111827",
    fontFamily: "Helvetica",
  },
  riskHighlight: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 10,
    borderRadius: 4,
    marginVertical: 15,
  },
  riskTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#b91c1c",
    marginBottom: 5,
  },
  riskText: {
    fontSize: 9,
    color: "#7f1d1d",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
    textAlign: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#9ca3af",
    lineHeight: 1.3,
  },
});

interface SarReportProps {
  reportId: string;
  senderAddress: string;
  senderEmail: string;
  recipientAddress: string;
  amount: string;
  asset: string;
  riskScore: number;
  reason: string;
  timestamp: string;
}

export function SarPdfReport({
  reportId,
  senderAddress,
  senderEmail,
  recipientAddress,
  amount,
  asset,
  riskScore,
  reason,
  timestamp,
}: SarReportProps) {
  const maskedSender = maskAddress(senderAddress);
  const maskedEmail = maskEmail(senderEmail);
  const maskedRecipient = maskAddress(recipientAddress);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>WIRE$TABLE</Text>
            <Text style={styles.headerSub}>Compliance Intelligence System</Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>SAR-{reportId}</Text>
            <Text style={{ fontSize: 7, color: "#9ca3af" }}>Generated: {timestamp}</Text>
          </View>
        </View>

        {/* Document Title */}
        <Text style={styles.docTitle}>SUSPICIOUS ACTIVITY REPORT (SAR) / AML AUDIT EXPORT</Text>

        {/* Section 1: Reporting Entity */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>1. REPORTING PLATFORM INFORMATION</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Platform Name</Text>
            <Text style={styles.value}>WireStable Remittance Suite</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Network Corridor</Text>
            <Text style={styles.value}>Arc Testnet (Chain ID 5042002)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Regulatory Body Jurisdiction</Text>
            <Text style={styles.value}>UAE Financial Intelligence Unit (FIU)</Text>
          </View>
        </View>

        {/* Section 2: Sender Details (PII Encrypted) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>2. SENDER DETAILS (ENCRYPTED / MASKED PII)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Account Custody Method</Text>
            <Text style={styles.value}>Circle User-Controlled Wallet / Embedded Key</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sender Wallet Address</Text>
            <Text style={styles.value}>{maskedSender}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Registered User Identity (Email)</Text>
            <Text style={styles.value}>{maskedEmail}</Text>
          </View>
        </View>

        {/* Section 3: Flagged Target & Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>3. FLAGGED RECIPIENT & TRANSACTION</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Recipient Address</Text>
            <Text style={styles.value}>{maskedRecipient}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Intended Amount</Text>
            <Text style={styles.value}>{amount} {asset}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Corridor Chain</Text>
            <Text style={styles.value}>Arcscan Testnet Ledger</Text>
          </View>
        </View>

        {/* Section 4: Risk Scoring Metrics */}
        <View style={styles.riskHighlight}>
          <Text style={styles.riskTitle}>4. AML SECURITY & RISK REPORT MATRIX</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Computed Risk Index</Text>
            <Text style={{ fontSize: 10, fontWeight: "bold", color: "#b91c1c" }}>{riskScore} / 100</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Compliance Outcome</Text>
            <Text style={{ fontSize: 9, fontWeight: "bold", color: "#b91c1c" }}>BLOCKED (Score &gt;= 75)</Text>
          </View>
          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>Security Audit Explanation:</Text>
            <Text style={styles.riskText}>{reason}</Text>
          </View>
        </View>

        {/* Regulatory Disclosure Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            CONFIDENTIAL REGULATORY DOCUMENT - FOR LAW ENFORCEMENT & COMPLIANCE AUDITING PURPOSES ONLY
          </Text>
          <Text style={styles.footerText}>
            Exported by WireStable Compliance Agent. All PII is cryptographically masked. Do not redistribute.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
