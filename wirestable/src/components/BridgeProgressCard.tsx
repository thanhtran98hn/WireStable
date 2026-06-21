"use client";

import React from "react";
import { type BridgeStep } from "@/hooks/useCCTP";

interface BridgeProgressCardProps {
  step: BridgeStep;
  burnHash: string | null;
  mintHash: string | null;
  messageHash: string | null;
  attestationSignature: string | null;
  error: string | null;
  amount: string;
  sourceChain: string;
  destinationChain: string;
  toAddress: string;
  onClose?: () => void;
}

export function BridgeProgressCard({
  step,
  burnHash,
  mintHash,
  messageHash,
  attestationSignature,
  error,
  amount,
  sourceChain,
  destinationChain,
  toAddress,
  onClose,
}: BridgeProgressCardProps) {
  // Define steps for visual vertical progress tracker
  const stepsList = [
    {
      id: "origin",
      label: `Switch Wallet to ${sourceChain} & Approve USDC`,
      activeSteps: ["switching-origin", "approving"] as BridgeStep[],
      doneSteps: ["burning", "polling-attestation", "switching-destination", "minting", "success"] as BridgeStep[],
    },
    {
      id: "burn",
      label: `Burn USDC on ${sourceChain}`,
      activeSteps: ["burning"] as BridgeStep[],
      doneSteps: ["polling-attestation", "switching-destination", "minting", "success"] as BridgeStep[],
      hash: burnHash,
      explorer: sourceChain === "Base" 
        ? `https://sepolia.basescan.org/tx/` 
        : sourceChain === "Arbitrum" 
        ? `https://sepolia.arbiscan.io/tx/` 
        : `https://sepolia.etherscan.io/tx/`,
    },
    {
      id: "attestation",
      label: "Fetch Circle CCTP Consensus Attestation",
      activeSteps: ["polling-attestation"] as BridgeStep[],
      doneSteps: ["switching-destination", "minting", "success"] as BridgeStep[],
      info: messageHash ? `Msg Hash: ${messageHash.slice(0, 8)}...${messageHash.slice(-6)}` : null,
    },
    {
      id: "destination",
      label: `Switch Wallet to Arc & Mint USDC`,
      activeSteps: ["switching-destination", "minting"] as BridgeStep[],
      doneSteps: ["success"] as BridgeStep[],
      hash: mintHash,
      explorer: `https://testnet.arcscan.io/tx/`, // Arcscan Explorer
    },
  ];

  const getStepStatus = (item: typeof stepsList[0]) => {
    if (step === "failed") {
      if (item.activeSteps.includes(step as any) || (item.id === "origin" && (step as any) === "switching-origin")) {
        return "error";
      }
      // If we failed at a step, later steps are pending, previous are done
      return "pending";
    }
    if (step === "success") return "done";
    if (item.activeSteps.includes(step)) return "active";
    if (item.doneSteps.includes(step)) return "done";
    return "pending";
  };

  return (
    <div className="w-full rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-4 mb-4">
        <div>
          <span className="bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Circle CCTP Bridge
          </span>
          <h4 className="text-sm font-extrabold text-[var(--color-text-primary)] mt-1 font-round">
            Bridging {amount} USDC from {sourceChain} to Arc
          </h4>
        </div>
        {step === "success" && (
          <span className="text-[var(--color-success)] text-xs font-semibold flex items-center gap-1">
            ✓ Complete
          </span>
        )}
        {step === "failed" && (
          <span className="text-[var(--color-error)] text-xs font-semibold flex items-center gap-1">
            ⚠️ Failed
          </span>
        )}
        {!["success", "failed", "idle"].includes(step) && (
          <span className="text-[var(--color-text-secondary)] text-xs font-semibold flex items-center gap-1.5 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] animate-ping" />
            In Progress
          </span>
        )}
      </div>

      {/* Destination Recipient Info */}
      <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-3 mb-6 flex flex-col gap-1 text-[11px] text-[var(--color-text-secondary)] border border-[var(--color-border-light)]">
        <div className="flex justify-between">
          <span>Recipient Address (Arc):</span>
          <span className="font-mono text-[var(--color-text-primary)] font-bold">{toAddress.slice(0, 8)}...{toAddress.slice(-6)}</span>
        </div>
      </div>

      {/* Stepper Content */}
      <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--color-border)]">
        {stepsList.map((item, idx) => {
          const status = getStepStatus(item);
          return (
            <div key={item.id} className="flex gap-4 relative z-10">
              {/* Step Circle Indicator */}
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-all duration-300 ${
                  status === "done"
                    ? "border-[var(--color-success)] bg-[var(--color-success-bg)] text-[var(--color-success)]"
                    : status === "active"
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-bg)] text-[var(--color-accent)] animate-pulse"
                    : status === "error"
                    ? "border-[var(--color-error)] bg-[var(--color-error-bg)] text-[var(--color-error)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)]"
                }`}
              >
                {status === "done" ? (
                  "✓"
                ) : status === "active" ? (
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : status === "error" ? (
                  "✕"
                ) : (
                  idx + 1
                )}
              </div>

              {/* Step details */}
              <div className="flex flex-col pt-0.5">
                <span
                  className={`text-xs font-semibold ${
                    status === "done"
                      ? "text-[var(--color-text-secondary)]"
                      : status === "active"
                      ? "text-[var(--color-text-primary)] font-bold"
                      : status === "error"
                      ? "text-[var(--color-error)] font-bold"
                      : "text-[var(--color-text-tertiary)]"
                  }`}
                >
                  {item.label}
                </span>

                {/* Info elements */}
                {item.info && status === "active" && (
                  <span className="text-[10px] text-[var(--color-text-secondary)] font-mono mt-1">
                    {item.info}
                  </span>
                )}

                {/* Tx Hash rendering */}
                {item.hash && (
                  <a
                    href={`${item.explorer}${item.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline font-mono mt-1 flex items-center gap-1 cursor-pointer"
                  >
                    Tx: {item.hash.slice(0, 10)}...{item.hash.slice(-8)}
                    <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Output block */}
      {error && (
        <div className="mt-4 p-3 rounded-2xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-[11px] text-[var(--color-error)] font-medium leading-relaxed">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {/* Action footer */}
      {step === "success" && onClose && (
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-[var(--color-text-inverse)] font-bold py-3 text-xs shadow-lg shadow-[var(--color-accent)]/15 transition-all cursor-pointer"
          type="button"
        >
          Return to Conversation
        </button>
      )}
    </div>
  );
}
