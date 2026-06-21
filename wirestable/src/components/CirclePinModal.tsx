"use client";

import { useState, useEffect } from "react";

interface CirclePinModalProps {
  isOpen: boolean;
  type: "REGISTER" | "TRANSFER" | null;
  onConfirm: (pin: string) => void;
  onCancel: () => void;
}

export function CirclePinModal({ isOpen, type, onConfirm, onCancel }: CirclePinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (pin.length === 6) {
      onConfirm(pin);
    } else {
      setError("PIN must be exactly 6 digits.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-text-primary)]/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-2xl backdrop-blur-xl animate-scale-up">
        {/* Decorative backdrop gradients */}
        <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-[var(--color-bg-secondary)] blur-3xl"></div>
        <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-[var(--color-bg-tertiary)] blur-3xl"></div>

        {/* Modal Header */}
        <div className="relative z-10 text-center mb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {type === "REGISTER" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              )}
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-[var(--color-text-primary)] tracking-tight font-round">
            {type === "REGISTER" ? "Set Security PIN" : "Authorize Transaction"}
          </h3>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {type === "REGISTER"
              ? "Create a 6-digit PIN to secure your Circle smart wallet."
              : "Enter your 6-digit PIN to authorize this transfer request."}
          </p>
          <span className="mt-2 inline-block text-[10px] uppercase font-bold tracking-wider text-[var(--color-warning)] bg-[var(--color-warning-bg)] px-2 py-0.5 rounded-full">
            Circle UCW Sandbox Simulation
          </span>
        </div>

        {/* PIN Indicators */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 mb-6">
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 w-4 rounded-full border transition-all duration-150 ${
                  i < pin.length
                    ? "bg-[var(--color-accent)] border-[var(--color-accent)] scale-110 shadow-lg shadow-[var(--color-accent)]/20"
                    : "border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
                }`}
              />
            ))}
          </div>
          {error && <p className="text-xs text-[var(--color-error)] font-semibold">{error}</p>}
        </div>

        {/* Custom Numeric Keypad */}
        <div className="relative z-10 grid grid-cols-3 gap-3 max-w-[280px] mx-auto mb-6">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="flex h-14 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-lg font-extrabold text-[var(--color-text-primary)] hover:border-[var(--color-border-focus)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] active:scale-95 transition-all duration-100 font-round"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={onCancel}
            className="flex h-14 items-center justify-center rounded-2xl text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            className="flex h-14 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-lg font-extrabold text-[var(--color-text-primary)] hover:border-[var(--color-border-focus)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] active:scale-95 transition-all duration-100 font-round"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="flex h-14 items-center justify-center rounded-2xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] active:scale-95 transition-all"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0010.828 5H20a2 2 0 012 2v10a2 2 0 01-2 2h-9.172a2 2 0 01-1.414-.586L3 12z"
              />
            </svg>
          </button>
        </div>

        {/* Submit Action */}
        <div className="relative z-10 flex gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pin.length < 6}
            className="w-full rounded-2xl bg-[var(--color-accent)] py-3.5 text-center text-sm font-bold text-[var(--color-text-inverse)] shadow-lg shadow-[var(--color-accent)]/15 hover:bg-[var(--color-accent-light)] disabled:opacity-50 disabled:pointer-events-none active:scale-98 transition-all"
          >
            {type === "REGISTER" ? "Confirm & Setup Wallet" : "Authorize & Sign"}
          </button>
        </div>
      </div>
    </div>
  );
}
