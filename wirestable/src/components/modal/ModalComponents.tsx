"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// ModalPortal Component
export function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}

// Focus trap & click-outside hook helper
interface ModalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdropClick?: boolean;
}

export function ModalOverlay({
  isOpen,
  onClose,
  children,
  closeOnBackdropClick = true,
}: ModalOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Escape key & Focus management
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC closes modal
      if (e.key === "Escape") {
        onClose();
      }

      // Focus trap
      if (e.key === "Tab") {
        if (!containerRef.current) return;
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Initial focus on container
    if (containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        // Focus first input or button, otherwise focus container
        focusableElements[0].focus();
      } else {
        containerRef.current.focus();
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // Restore focus
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05060b]/75 p-4 backdrop-blur-md outline-none animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-scale-up md:p-8">
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-[var(--color-primary)]/10 blur-3xl"></div>
        <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-[var(--color-bg-chat-user)]/10 blur-3xl"></div>
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

// ModalHeader Component
interface ModalHeaderProps {
  title?: string;
  onClose?: () => void;
  icon?: React.ReactNode;
  showCloseButton?: boolean;
}

export function ModalHeader({ title, onClose, icon, showCloseButton = true }: ModalHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            {icon}
          </div>
        )}
        {title && (
          <h3 className="text-xl font-bold font-serif text-[var(--color-text-primary)] leading-tight tracking-tight">
            {title}
          </h3>
        )}
      </div>
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] active:scale-95 transition-all"
          aria-label="Close modal"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ModalBody Component
export function ModalBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`max-h-[60vh] overflow-y-auto pr-1 text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6 ${className}`}>
      {children}
    </div>
  );
}

// ModalFooter Component
export function ModalFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col sm:flex-row justify-end gap-3 border-t border-[var(--color-border)] pt-4 ${className}`}>
      {children}
    </div>
  );
}

// ModalIcon Component
export function ModalIcon({ type }: { type: "info" | "success" | "warning" | "error" | "tx" | "system" }) {
  const classes = {
    info: "text-[var(--color-info)] bg-[var(--color-info-bg)] border-[var(--color-info)]/20",
    success: "text-[var(--color-success)] bg-[var(--color-success-bg)] border-[var(--color-success)]/20",
    warning: "text-[var(--color-warning)] bg-[var(--color-warning-bg)] border-[var(--color-warning)]/20",
    error: "text-[var(--color-error)] bg-[var(--color-error-bg)] border-[var(--color-error)]/20",
    tx: "text-[var(--color-accent)] bg-[var(--color-accent-bg)] border-[var(--color-accent)]/20",
    system: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  }[type];

  const icons = {
    info: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    success: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    error: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    tx: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
    system: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  }[type];

  return (
    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${classes}`}>
      {icons}
    </div>
  );
}

// ModalErrorBoundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ModalErrorBoundary extends React.Component<
  { children: React.ReactNode; onClose: () => void },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; onClose: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Critical rendering failure in Modal:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold font-serif text-[var(--color-text-primary)] mb-2">
            Modal Crashed
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mb-6">
            A critical error occurred while displaying this modal window.
          </p>
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={this.props.onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
            >
              Close Window
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
