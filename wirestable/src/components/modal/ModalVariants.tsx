"use client";

import React, { useState, useEffect } from "react";
import {
  ModalOverlay,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalIcon,
} from "./ModalComponents";
import {
  ConfirmationModalProps,
  ProcessingModalProps,
  SuccessModalProps,
  ErrorModalProps,
  WarningModalProps,
  TransactionModalProps,
  SystemModalProps,
} from "@/types/modal";
import { mapRawError } from "@/utils/errorMapper";

// 1. Confirmation Modal
export function ConfirmationModal({
  isOpen,
  onClose,
  title = "Confirm Action",
  description,
  variant = "neutral",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  loading: initialLoading = false,
}: ConfirmationModalProps) {
  const [loading, setLoading] = useState(initialLoading);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getConfirmButtonClass = () => {
    if (variant === "destructive") {
      return "btn btn-danger";
    }
    if (variant === "warning") {
      return "btn bg-[var(--color-warning-bg)] text-[var(--color-warning)] hover:bg-[var(--color-warning)] hover:text-white border border-[var(--color-warning)]/20";
    }
    return "btn btn-primary";
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={loading ? () => {} : onClose}>
      <ModalHeader
        title={title}
        onClose={loading ? undefined : onClose}
        icon={
          <ModalIcon
            type={variant === "destructive" || variant === "warning" ? "warning" : "info"}
          />
        }
      />
      <ModalBody>
        <p className="text-[var(--color-text-secondary)]">{description}</p>
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="btn btn-secondary"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={handleConfirm}
          className={getConfirmButtonClass()}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Processing...</span>
            </div>
          ) : (
            confirmLabel
          )}
        </button>
      </ModalFooter>
    </ModalOverlay>
  );
}

// 2. Processing Modal
export function ProcessingModal({
  isOpen,
  onClose,
  title = "Processing Request",
  description,
  status = "Executing steps...",
  progress,
  estimatedTime,
  steps,
  currentStepIndex = 0,
}: ProcessingModalProps) {
  return (
    <ModalOverlay isOpen={isOpen} onClose={() => {}} closeOnBackdropClick={false}>
      <ModalHeader title={title} showCloseButton={false} icon={<ModalIcon type="tx" />} />
      <ModalBody>
        {description && <p className="mb-4 text-[var(--color-text-secondary)]">{description}</p>}

        {/* Progress Bar / Ring */}
        {progress !== undefined && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[var(--color-text-tertiary)]">Overall Progress</span>
              <span className="font-semibold text-[var(--color-accent)]">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-[var(--color-bg-secondary)] rounded-full overflow-hidden border border-[var(--color-border)]">
              <div
                className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Dynamic step-by-step indicators */}
        {steps && steps.length > 0 ? (
          <div className="space-y-3 mb-6 bg-[var(--color-bg-secondary)] p-4 rounded-2xl border border-[var(--color-border)]">
            {steps.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              const isCompleted = idx < currentStepIndex || step.status === "done";
              const isError = step.status === "error";

              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex items-center justify-center shrink-0">
                    {isCompleted ? (
                      <span className="text-[var(--color-success)] text-base">✓</span>
                    ) : isError ? (
                      <span className="text-[var(--color-error)] text-base">✗</span>
                    ) : isActive ? (
                      <svg className="animate-spin h-4 w-4 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-[var(--color-border)]" />
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      isActive
                        ? "text-[var(--color-text-primary)] font-bold"
                        : isCompleted
                        ? "text-[var(--color-text-tertiary)] line-through"
                        : isError
                        ? "text-[var(--color-error)] font-medium"
                        : "text-[var(--color-text-tertiary)]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Shimmer Fallback */
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] animate-pulse">
            <div className="h-4 w-4 bg-[var(--color-border)] rounded-full"></div>
            <div className="h-3 flex-1 bg-[var(--color-border)] rounded"></div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
          <span className="italic">{status}</span>
          {estimatedTime && <span>Est. remaining: {estimatedTime}</span>}
        </div>
      </ModalBody>
    </ModalOverlay>
  );
}

// 3. Success Modal
export function SuccessModal({
  isOpen,
  onClose,
  title = "Success!",
  description,
  autoCloseDelay,
  continueLabel = "Continue",
  onContinue,
  detailsLabel,
  onViewDetails,
  showCelebration = false,
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen && autoCloseDelay) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalHeader title={title} onClose={onClose} icon={<ModalIcon type="success" />} />
      <ModalBody>
        <p className="text-[var(--color-text-secondary)]">{description}</p>

        {showCelebration && (
          <div className="relative mt-4 flex items-center justify-center p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-emerald-400 font-bold overflow-hidden">
            🎉 Action Confirmed with Finality
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        {detailsLabel && onViewDetails && (
          <button type="button" onClick={onViewDetails} className="btn btn-secondary">
            {detailsLabel}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (onContinue) onContinue();
            onClose();
          }}
          className="btn btn-primary"
        >
          {continueLabel}
        </button>
      </ModalFooter>
    </ModalOverlay>
  );
}

// 4. Error Modal
export function ErrorModal({
  isOpen,
  onClose,
  title = "An Error Occred",
  description,
  error,
  retryLabel = "Retry",
  onRetry,
  supportLabel = "Support",
  onSupport,
  reportLabel = "Report Issue",
  onReport,
}: ErrorModalProps) {
  // Interpret raw error message
  const mapped = mapRawError(error);

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title={mapped.title || title}
        onClose={onClose}
        icon={<ModalIcon type="error" />}
      />
      <ModalBody>
        <p className="mb-4 text-[var(--color-text-primary)] font-medium">
          {mapped.message || description}
        </p>

        {/* Error Code metadata box */}
        <div className="p-3 bg-[var(--color-error-bg)] rounded-xl border border-[var(--color-error)]/10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-error)]">
            Error Code: {mapped.code}
          </span>
          {error && typeof error === "object" && (error as any).message && (
            <details className="mt-1 text-[11px] text-[var(--color-text-tertiary)] cursor-pointer">
              <summary className="hover:text-[var(--color-text-secondary)] font-mono">
                View Raw Details
              </summary>
              <pre className="mt-2 p-2 bg-[var(--color-bg)] rounded border border-[var(--color-border)] overflow-x-auto whitespace-pre-wrap select-all max-h-[120px] font-mono leading-tight">
                {String((error as any).stack || (error as any).message || error)}
              </pre>
            </details>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        {onReport && (
          <button type="button" onClick={onReport} className="btn btn-secondary text-xs">
            {reportLabel}
          </button>
        )}
        {onSupport && (
          <button type="button" onClick={onSupport} className="btn btn-secondary text-xs">
            {supportLabel}
          </button>
        )}
        {onRetry && mapped.actionType === "retry" ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onRetry) onRetry();
            }}
            className="btn btn-primary"
          >
            {retryLabel}
          </button>
        ) : (
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Dismiss
          </button>
        )}
      </ModalFooter>
    </ModalOverlay>
  );
}

// 5. Warning Modal
export function WarningModal({
  isOpen,
  onClose,
  title = "Security Warning",
  riskText,
  impactText,
  consequenceText,
  acknowledgeLabel = "I Understand & Accept Risks",
  onAcknowledge,
}: WarningModalProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalHeader title={title} onClose={onClose} icon={<ModalIcon type="warning" />} />
      <ModalBody>
        <div className="space-y-4 mb-4">
          <div className="p-3 bg-[var(--color-warning-bg)]/10 border border-[var(--color-warning)]/10 rounded-xl">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[var(--color-warning)] block mb-1">
              Risk Profile
            </span>
            <p className="text-xs text-[var(--color-text-secondary)]">{riskText}</p>
          </div>

          <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-red-400 block mb-1">
              Potential Impact
            </span>
            <p className="text-xs text-[var(--color-text-secondary)]">{impactText}</p>
          </div>

          <div className="p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[var(--color-text-tertiary)] block mb-1">
              Consequence
            </span>
            <p className="text-xs text-[var(--color-text-secondary)]">{consequenceText}</p>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <label className="flex items-center gap-3 p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl cursor-pointer hover:border-[var(--color-border-light)] transition-all">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="h-4.5 w-4.5 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
          />
          <span className="text-xs text-[var(--color-text-primary)] font-medium">
            I confirm that I understand and accept the potential loss of funds or access.
          </span>
        </label>
      </ModalBody>
      <ModalFooter>
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
        <button
          type="button"
          disabled={!agreed}
          onClick={() => {
            onAcknowledge();
            onClose();
          }}
          className="btn btn-primary"
        >
          {acknowledgeLabel}
        </button>
      </ModalFooter>
    </ModalOverlay>
  );
}

// 6. Transaction Modal
export function TransactionModal({
  isOpen,
  onClose,
  title = "Blockchain Transaction",
  txState,
  txHash,
  explorerUrl,
  gasStatus = "average",
  errorMessage,
  onRetry,
}: TransactionModalProps) {
  const getStatusText = () => {
    switch (txState) {
      case "preparing":
        return "Preparing transaction details...";
      case "awaiting_signature":
        return "Awaiting your wallet signature...";
      case "pending":
        return "Broadcasting to Arc network...";
      case "confirming":
        return "Waiting for sub-second block confirmation...";
      case "success":
        return "Transaction successfully confirmed!";
      case "failed":
        return "Transaction reverted or failed.";
      case "rejected":
        return "Signature request rejected.";
      case "expired":
        return "Request expired. Please sign again.";
      case "timeout":
        return "Confirmation timeout. Check block explorer.";
      default:
        return "Processing transaction...";
    }
  };

  const getStatusIcon = () => {
    if (txState === "success") {
      return (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)]/20 animate-bounce">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (["failed", "rejected", "expired", "timeout"].includes(txState)) {
      return (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error)]/20 animate-[shake_0.5s_ease-in-out]">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }
    return (
      <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-bg)] text-[var(--color-accent)] border border-[var(--color-accent)]/20">
        <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  };

  const showCloseButton = ["success", "failed", "rejected", "expired", "timeout"].includes(txState);

  return (
    <ModalOverlay isOpen={isOpen} onClose={showCloseButton ? onClose : () => {}} closeOnBackdropClick={showCloseButton}>
      <ModalHeader title={title} onClose={showCloseButton ? onClose : undefined} showCloseButton={showCloseButton} />
      <ModalBody>
        <div className="text-center py-6">
          <div className="mb-4">{getStatusIcon()}</div>
          <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
            {getStatusText()}
          </h4>
          <p className="text-xs text-[var(--color-text-tertiary)] max-w-xs mx-auto mb-6">
            Arc Testnet transaction with gas-abstracted sub-second finality.
          </p>

          {/* Gas Status indicator if loading */}
          {!showCloseButton && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-full mb-6">
              <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Gas Fee Rate:</span>
              <span className={`text-[10px] font-bold uppercase ${
                gasStatus === "low" || gasStatus === "average" ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"
              }`}>
                {gasStatus}
              </span>
            </div>
          )}

          {/* Details / Error */}
          {errorMessage && (
            <div className="max-w-md mx-auto p-3 bg-[var(--color-error-bg)] border border-[var(--color-error)]/10 text-left rounded-xl text-xs text-[var(--color-error)] font-mono whitespace-pre-wrap max-h-[80px] overflow-y-auto mb-6">
              {errorMessage}
            </div>
          )}

          {/* Transaction Hash */}
          {txHash && (
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-4 max-w-sm mx-auto text-left">
              <div className="flex justify-between items-center text-[11px] text-[var(--color-text-tertiary)] mb-1">
                <span>Transaction Hash</span>
                {explorerUrl && (
                  <a
                    href={`${explorerUrl}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-accent)] hover:underline flex items-center gap-1 font-semibold"
                  >
                    View on Arcscan ↗
                  </a>
                )}
              </div>
              <div className="font-mono text-xs text-[var(--color-text-secondary)] break-all select-all selection:bg-[var(--color-accent-bg)]">
                {txHash}
              </div>
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter className="sm:justify-center">
        {showCloseButton ? (
          ["failed", "expired", "timeout"].includes(txState) && onRetry ? (
            <div className="flex gap-3 w-full">
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                Dismiss
              </button>
              <button type="button" onClick={onRetry} className="btn btn-primary flex-1">
                Retry Transaction
              </button>
            </div>
          ) : (
            <button type="button" onClick={onClose} className="btn btn-primary w-full max-w-[200px]">
              Done
            </button>
          )
        ) : (
          <div className="text-center text-xs text-[var(--color-text-tertiary)]">
            Please keep this window open until confirmation completes.
          </div>
        )}
      </ModalFooter>
    </ModalOverlay>
  );
}

// 7. System Modal
export function SystemModal({
  isOpen,
  onClose,
  title = "System Announcement",
  variant,
  criticalTime,
  actionLabel = "Acknowledge",
  onAction,
  description,
}: SystemModalProps) {
  const getBannerText = () => {
    switch (variant) {
      case "maintenance":
        return "Upcoming Maintenance";
      case "downtime":
        return "Emergency Downtime Action Required";
      case "migration":
        return "Network Contract Migration Required";
      case "security_alert":
        return "Critical Security Patch Notice";
      default:
        return "System Announcement";
    }
  };

  const getSystemColor = () => {
    if (variant === "security_alert" || variant === "downtime") {
      return "text-red-400 border-red-500/20 bg-red-500/5";
    }
    return "text-[var(--color-warning)] border-[var(--color-warning)]/20 bg-[var(--color-warning-bg)]/10";
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} closeOnBackdropClick={variant !== "downtime"}>
      <ModalHeader title={title} onClose={onClose} icon={<ModalIcon type="system" />} />
      <ModalBody>
        <div className={`p-3 border rounded-xl mb-4 font-bold text-xs uppercase text-center ${getSystemColor()}`}>
          {getBannerText()}
        </div>
        <p className="text-[var(--color-text-secondary)] mb-4">{description}</p>
        {criticalTime && (
          <div className="p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl flex justify-between text-xs">
            <span className="text-[var(--color-text-tertiary)]">Scheduled Time:</span>
            <span className="font-bold text-[var(--color-text-primary)]">{criticalTime}</span>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          onClick={() => {
            if (onAction) onAction();
            onClose();
          }}
          className="btn btn-primary w-full sm:w-auto"
        >
          {actionLabel}
        </button>
      </ModalFooter>
    </ModalOverlay>
  );
}
