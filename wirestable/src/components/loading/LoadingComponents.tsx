"use client";

import React, { useState, useEffect } from "react";
import { BoltIcon, HourglassIcon } from "@/components/icons/CustomIcons";

// ==========================================
// 1. LoadingButton
// ==========================================
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: React.ReactNode;
}

export function LoadingButton({
  children,
  loading = false,
  loadingText,
  variant = "primary",
  icon,
  className = "",
  disabled,
  onClick,
  ...props
}: LoadingButtonProps) {
  const [clickScale, setClickScale] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    setClickScale(true);
    setTimeout(() => setClickScale(false), 150);
    if (onClick) onClick(e);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-[var(--color-accent)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-light)] shadow-md shadow-[var(--color-accent)]/15 border-transparent";
      case "secondary":
        return "bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] border-[var(--color-border)]";
      case "danger":
        return "bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/15 border-transparent";
      case "ghost":
        return "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] border-transparent";
      default:
        return "";
    }
  };

  return (
    <button
      disabled={loading || disabled}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 active:scale-98 select-none ${getVariantClasses()} ${
        loading ? "cursor-wait opacity-80" : "cursor-pointer"
      } ${clickScale ? "scale-95" : ""} ${className}`}
      style={{
        minHeight: "44px", // prevents height layout shifts
      }}
      {...props}
    >
      {/* Inline Spinner / Icon */}
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin-circle text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
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
      ) : (
        icon
      )}

      {/* Button Text */}
      <span className="flex items-center gap-1 transition-all duration-150">
        {loading ? loadingText || "Processing..." : children}
      </span>
    </button>
  );
}

// ==========================================
// 2. LoadingCard
// ==========================================
export function LoadingCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="h-10 w-10 skeleton-glow rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 skeleton-glow rounded" />
          <div className="h-3 w-1/4 skeleton-glow rounded opacity-60" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 w-full skeleton-glow rounded" />
        <div className="h-3 w-5/6 skeleton-glow rounded" />
        <div className="h-3 w-2/3 skeleton-glow rounded" />
      </div>
    </div>
  );
}

// ==========================================
// 3. LoadingTable
// ==========================================
export function LoadingTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="p-4">
                  <div className="h-3 w-2/3 skeleton-glow rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-b border-[var(--color-border)]/50 last:border-0 hover:bg-white/[0.01]">
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} className="p-4">
                    <div
                      className="h-3 skeleton-glow rounded"
                      style={{ width: `${Math.floor(Math.random() * 40) + 50}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 4. LoadingList
// ==========================================
export function LoadingList({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/60 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 skeleton-glow rounded-lg" />
            <div className="space-y-1.5">
              <div className="h-3 w-28 skeleton-glow rounded" />
              <div className="h-2 w-16 skeleton-glow rounded opacity-60" />
            </div>
          </div>
          <div className="h-3 w-12 skeleton-glow rounded" />
        </div>
      ))}
    </div>
  );
}

// ==========================================
// 5. LoadingGrid
// ==========================================
export function LoadingGrid({ items = 6, cols = 3 }: { items?: number; cols?: number }) {
  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[cols as 1 | 2 | 3 | 4] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid gap-6 ${gridColsClass}`}>
      {Array.from({ length: items }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}

// ==========================================
// 6. LoadingModal
// ==========================================
export function LoadingModal() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-2xl animate-scale-up">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--color-accent)]/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[var(--color-accent)] animate-spin-circle" />
          </div>
          <div className="h-4 w-1/2 skeleton-glow rounded mb-3" />
          <div className="h-3 w-3/4 skeleton-glow rounded opacity-75 mb-2" />
          <div className="h-3 w-2/3 skeleton-glow rounded opacity-75" />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. LoadingChart
// ==========================================
export function LoadingChart() {
  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-4 w-32 skeleton-glow rounded" />
          <div className="h-3 w-20 skeleton-glow rounded opacity-60" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-12 skeleton-glow rounded-lg" />
          <div className="h-7 w-12 skeleton-glow rounded-lg" />
        </div>
      </div>
      {/* Chart bars simulation with staggered delays */}
      <div className="flex h-48 items-end gap-3 px-2 pt-4 border-b border-[var(--color-border)]/50">
        {[45, 60, 35, 75, 90, 50, 65, 80, 40, 70, 85, 95].map((height, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-lg bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 transition-all duration-300 relative overflow-hidden"
            style={{
              height: `${height}%`,
            }}
          >
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-t" />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-3 text-[10px] text-[var(--color-text-tertiary)] px-1">
        <div>Jan</div>
        <div>Jun</div>
        <div>Dec</div>
      </div>
    </div>
  );
}

// ==========================================
// 8. LoadingAvatar
// ==========================================
export function LoadingAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-11 w-11",
    lg: "h-16 w-16",
  }[size];

  return <div className={`${sizeClasses} skeleton-glow rounded-full`} />;
}

// ==========================================
// 9. LoadingImage
// ==========================================
interface LoadingImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export function LoadingImage({ src, alt, className = "", ...props }: LoadingImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white/[0.02] ${className}`}>
      {/* Blurred Shimmer Placeholder */}
      {!loaded && (
        <div className="absolute inset-0 z-10 animate-shimmer" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        {...props}
      />
    </div>
  );
}

// ==========================================
// 10. LoadingForm
// ==========================================
export function LoadingForm() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-20 skeleton-glow rounded" />
        <div className="h-11 w-full skeleton-glow rounded-2xl" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-28 skeleton-glow rounded" />
        <div className="h-11 w-full skeleton-glow rounded-2xl" />
      </div>
      <div className="flex gap-4 pt-2">
        <div className="h-11 w-24 skeleton-glow rounded-2xl" />
        <div className="h-11 flex-1 skeleton-glow rounded-2xl" />
      </div>
    </div>
  );
}

// ==========================================
// 11. LoadingInput
// ==========================================
export function LoadingInput() {
  return (
    <div className="relative w-full">
      <div className="h-11 w-full skeleton-glow rounded-2xl border border-[var(--color-border)]/50" />
      <div className="absolute right-3.5 top-3.5 h-4 w-4 rounded-full border-2 border-[var(--color-accent)]/20 border-t-[var(--color-accent)] animate-spin-circle" />
    </div>
  );
}

// ==========================================
// 12. LoadingSearch
// ==========================================
export function LoadingSearch() {
  return (
    <div className="relative w-full">
      <div className="absolute left-3.5 top-3.5 h-4 w-4 skeleton-glow rounded-full" />
      <div className="h-11 w-full skeleton-glow rounded-2xl pl-10" />
      <div className="absolute right-3.5 top-3.5 h-4 w-4 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin-circle" />
    </div>
  );
}

// ==========================================
// 13. LoadingUpload / LoadingDownload
// ==========================================
interface LoadingProgressProps {
  fileName: string;
  fileSize?: string;
  progress: number;
  speed?: string;
  eta?: string;
  onCancel?: () => void;
  onPause?: () => void;
  onRetry?: () => void;
  isPaused?: boolean;
  hasFailed?: boolean;
}

export function LoadingProgress({
  fileName,
  fileSize,
  progress,
  speed,
  eta,
  onCancel,
  onPause,
  onRetry,
  isPaused = false,
  hasFailed = false,
}: LoadingProgressProps) {
  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-bold text-[var(--color-text-primary)]">
            {fileName}
          </h4>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            {fileSize && `${fileSize} · `}
            {hasFailed ? (
              <span className="text-rose-500 font-semibold">Failed</span>
            ) : isPaused ? (
              <span className="text-amber-500 font-semibold">Paused</span>
            ) : (
              <span>{progress}% complete</span>
            )}
          </p>
        </div>
        
        {/* Buttons for Pause/Cancel */}
        <div className="flex gap-2">
          {hasFailed && onRetry && (
            <button
              onClick={onRetry}
              className="text-xs px-2.5 py-1 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-all font-semibold"
            >
              Retry
            </button>
          )}
          {!hasFailed && onPause && (
            <button
              onClick={onPause}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.03] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all font-semibold"
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs px-2.5 py-1 rounded-lg hover:bg-white/[0.03] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-all font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.03] mb-2">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            hasFailed
              ? "bg-rose-500"
              : isPaused
              ? "bg-amber-500"
              : "bg-gradient-to-r from-[var(--color-accent)] to-[#ff8c72]"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Transfer Metrics */}
      {!hasFailed && !isPaused && (speed || eta) && (
        <div className="flex justify-between text-[11px] text-[var(--color-text-tertiary)]">
          {speed && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
              <BoltIcon size={12} animate /> {speed}
            </span>
          )}
          {eta && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
              <HourglassIcon size={12} animate /> {eta} remaining
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 14. LoadingDashboard
// ==========================================
export function LoadingDashboard() {
  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-lg">
            <div className="h-3 w-1/3 skeleton-glow rounded mb-3" />
            <div className="h-6 w-1/2 skeleton-glow rounded mb-2" />
            <div className="h-2 w-1/4 skeleton-glow rounded opacity-65" />
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <LoadingChart />

      {/* Tables Section */}
      <div className="space-y-2">
        <div className="h-4 w-40 skeleton-glow rounded" />
        <LoadingTable rows={3} cols={4} />
      </div>
    </div>
  );
}

// ==========================================
// 15. LoadingOverlay & LoadingPage
// ==========================================
export function LoadingOverlay({ message = "Synchronizing data..." }: { message?: string }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[var(--color-bg)]/60 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 rounded-full border-3 border-[var(--color-accent)]/15 border-t-[var(--color-accent)] animate-spin-circle mb-3" />
        <p className="text-xs font-semibold text-[var(--color-text-secondary)] animate-glow-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#05060b]">
      <div className="relative flex flex-col items-center">
        {/* WireStable glowing logo mock */}
        <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-glow">
          <div className="h-6 w-6 rounded-lg bg-[var(--color-accent)] animate-glow-pulse" />
        </div>
        <div className="h-3 w-28 skeleton-glow rounded mb-2" />
        <div className="h-2 w-48 skeleton-glow rounded opacity-50" />
      </div>
    </div>
  );
}

// ==========================================
// 16. LoadingRouteTransition (Top bar)
// ==========================================
export function LoadingRouteTransition({ active = false }: { active?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (active) {
      setVisible(true);
      setWidth(30);
      const timer1 = setTimeout(() => setWidth(60), 400);
      const timer2 = setTimeout(() => setWidth(85), 1000);
      const timer3 = setTimeout(() => setWidth(95), 2500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      if (width > 0) {
        setWidth(100);
        const timer = setTimeout(() => {
          setVisible(false);
          setWidth(0);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [active, width]);

  if (!visible) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-0.5 w-full bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[#ff8c72] transition-all duration-300 ease-out shadow-lg shadow-[var(--color-accent)]/20"
        style={{
          width: `${width}%`,
        }}
      />
    </div>
  );
}
