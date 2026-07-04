"use client";

import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  animate?: boolean;
}

// ----------------------------------------------------
// 1. BriefcaseIcon (replacing 💼)
// ----------------------------------------------------
export function BriefcaseIcon({ size = 20, animate = false, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-briefcase ${animate ? "animate-bounce-subtle" : ""} ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="briefcaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-accent-light)" />
        </linearGradient>
      </defs>
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="url(#briefcaseGrad)" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

// ----------------------------------------------------
// 2. WarningIcon (replacing ⚠️ or ⚠)
// ----------------------------------------------------
export function WarningIcon({ size = 20, animate = false, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-warning ${animate ? "animate-pulse" : ""} ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="warningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ff6b4a" />
        </linearGradient>
      </defs>
      <path d="m12 3-10 18h20Z" stroke="url(#warningGrad)" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

// ----------------------------------------------------
// 3. BoltIcon (replacing ⚡)
// ----------------------------------------------------
export function BoltIcon({ size = 20, animate = false, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-bolt ${animate ? "animate-pulse" : ""} ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
      <path d="M13 2 L3 14 H12 L11 22 L21 10 H12 L13 2 Z" fill="url(#boltGrad)" stroke="url(#boltGrad)" />
    </svg>
  );
}

// ----------------------------------------------------
// 4. HelpIcon (replacing ❓)
// ----------------------------------------------------
export function HelpIcon({ size = 20, animate = false, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-help ${className}`}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

// ----------------------------------------------------
// 5. DocsIcon (replacing 📖)
// ----------------------------------------------------
export function DocsIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-docs ${className}`}
      {...props}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

// ----------------------------------------------------
// 6. MailIcon (replacing ✉️)
// ----------------------------------------------------
export function MailIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-mail ${className}`}
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

// ----------------------------------------------------
// 7. LockIcon (replacing 🔒)
// ----------------------------------------------------
export function LockIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-lock ${className}`}
      {...props}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// ----------------------------------------------------
// 8. FileIcon (replacing 📄)
// ----------------------------------------------------
export function FileIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-file ${className}`}
      {...props}
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

// ----------------------------------------------------
// 9. WaveIcon (replacing 🌊)
// ----------------------------------------------------
export function WaveIcon({ size = 20, animate = false, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-wave ${animate ? "animate-wave-motion" : ""} ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="var(--color-primary)" />
        </linearGradient>
      </defs>
      <path d="M2 6c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" stroke="url(#waveGrad)" />
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" stroke="url(#waveGrad)" />
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" stroke="url(#waveGrad)" />
    </svg>
  );
}

// ----------------------------------------------------
// 10. IdeaIcon (replacing 💡)
// ----------------------------------------------------
export function IdeaIcon({ size = 20, animate = false, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-idea ${animate ? "animate-glow-pulse" : ""} ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="ideaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="100%" stopColor="var(--color-primary)" />
        </linearGradient>
      </defs>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" stroke="url(#ideaGrad)" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

// ----------------------------------------------------
// 11. BrainIcon (replacing 🧠)
// ----------------------------------------------------
export function BrainIcon({ size = 20, animate = false, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-brain ${animate ? "animate-pulse" : ""} ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
      </defs>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z" stroke="url(#brainGrad)" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z" stroke="url(#brainGrad)" />
    </svg>
  );
}

// ----------------------------------------------------
// 12. BuildingIcon (replacing 🏢)
// ----------------------------------------------------
export function BuildingIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-building ${className}`}
      {...props}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
    </svg>
  );
}

// ----------------------------------------------------
// 13. ChatIcon (replacing 💬)
// ----------------------------------------------------
export function ChatIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-chat ${className}`}
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// ----------------------------------------------------
// 14. SearchIcon (replacing 🔍)
// ----------------------------------------------------
export function SearchIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-search ${className}`}
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
    </svg>
  );
}

// ----------------------------------------------------
// 15. SirenIcon (replacing 🚨)
// ----------------------------------------------------
export function SirenIcon({ size = 20, animate = false, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-siren ${animate ? "animate-pulse" : ""} ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="sirenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M12 2v3" stroke="url(#sirenGrad)" />
      <path d="M20 18a8 8 0 0 0-16 0" stroke="url(#sirenGrad)" />
      <rect width="18" height="4" x="3" y="18" rx="1" />
    </svg>
  );
}

// ----------------------------------------------------
// 16. InboxIcon (replacing 📥)
// ----------------------------------------------------
export function InboxIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-inbox ${className}`}
      {...props}
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

// ----------------------------------------------------
// 17. ShieldIcon (replacing 🛡️)
// ----------------------------------------------------
export function ShieldIcon({ size = 20, animate = false, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-shield ${animate ? "animate-pulse" : ""} ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="url(#shieldGrad)" />
    </svg>
  );
}

// ----------------------------------------------------
// 18. CrownIcon (replacing 👑)
// ----------------------------------------------------
export function CrownIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-crown ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="100%" stopColor="var(--color-primary)" />
        </linearGradient>
      </defs>
      <path d="M2 4 5 12h14l3-8-7 4-3-6-3 6-7-4z" fill="url(#crownGrad)" stroke="url(#crownGrad)" />
      <path d="M5 20h14" />
    </svg>
  );
}

// ----------------------------------------------------
// 19. HomeIcon (replacing 🏠)
// ----------------------------------------------------
export function HomeIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-home ${className}`}
      {...props}
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

// ----------------------------------------------------
// 20. HourglassIcon (replacing ⏳ or ⌛)
// ----------------------------------------------------
export function HourglassIcon({ size = 20, animate = false, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-hourglass ${animate ? "animate-spin-slow" : ""} ${className}`}
      {...props}
    >
      <path d="M5 2h14" />
      <path d="M5 22h14" />
      <path d="M19 2v4c0 2-2 4-5 5v2c3 1 5 3 5 5v4" />
      <path d="M5 2v4c0 2 2 4 5 5v2c-3 1-5 3-5 5v4" />
    </svg>
  );
}

// ----------------------------------------------------
// 21. HandIcon (replacing 👋)
// ----------------------------------------------------
export function HandIcon({ size = 20, animate = false, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-hand ${animate ? "animate-wave-motion" : ""} ${className}`}
      {...props}
    >
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v9" />
      <path d="M10 18H5a3 3 0 0 1-3-3v-2" />
      <path d="M2 13a4 4 0 0 1 4-4h4v7" />
      <path d="M22 10.5V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
      <path d="M18 14a5 5 0 0 1 4 4v3H6v-3a5 5 0 0 1 4-4" />
    </svg>
  );
}

// ----------------------------------------------------
// 22. CheckIcon (replacing ✅ or ✓)
// ----------------------------------------------------
export function CheckIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-check text-[var(--color-success)] ${className}`}
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ----------------------------------------------------
// 23. CloseIcon (replacing ❌ or ✗ or ×)
// ----------------------------------------------------
export function CloseIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-close text-[var(--color-error)] ${className}`}
      {...props}
    >
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

// ----------------------------------------------------
// 24. PartyIcon (replacing 🎉)
// ----------------------------------------------------
export function PartyIcon({ size = 20, animate = false, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-party ${animate ? "animate-pulse" : ""} ${className}`}
      {...props}
    >
      <path d="M4 22 14 12" />
      <path d="m14 12 3 3-7 7-3-3 7-7Z" />
      <path d="m18 8 2 2" />
      <path d="m14 4 2 2" />
      <path d="m10 2 1 2" />
      <path d="m20 2-2 2" />
      <path d="M12 8h.01" />
      <path d="M18 14h.01" />
    </svg>
  );
}

// ----------------------------------------------------
// 25. GithubIcon (replacing 🐙)
// ----------------------------------------------------
export function GithubIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-github ${className}`}
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

// ----------------------------------------------------
// 26. TwitterIcon (replacing 🐦)
// ----------------------------------------------------
export function TwitterIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-twitter ${className}`}
      {...props}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

// ----------------------------------------------------
// 27. SyncIcon (replacing 🔄)
// ----------------------------------------------------
export function SyncIcon({ size = 20, animate = false, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-sync ${animate ? "animate-spin-circle" : ""} ${className}`}
      {...props}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M21 21v-5h-5" />
    </svg>
  );
}

// ----------------------------------------------------
// 28. StarIcon (replacing ★)
// ----------------------------------------------------
export function StarIcon({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-star text-yellow-500 ${className}`}
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// ----------------------------------------------------
// 29. MicIcon (replacing 🎤)
// ----------------------------------------------------
export function MicIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-mic ${className}`}
      {...props}
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

// ----------------------------------------------------
// 30. LinkIcon (replacing 🔗)
// ----------------------------------------------------
export function LinkIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-link ${className}`}
      {...props}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

// ----------------------------------------------------
// 31. TrendUpIcon (replacing 📈)
// ----------------------------------------------------
export function TrendUpIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-trend-up ${className}`}
      {...props}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

// ----------------------------------------------------
// 32. BridgeIcon (replacing 🌉)
// ----------------------------------------------------
export function BridgeIcon({ size = 20, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-bridge ${className}`}
      {...props}
    >
      <path d="M3 11a9 9 0 0 1 18 0" />
      <path d="M3 15h18" />
      <path d="M8 15v-4" />
      <path d="M16 15v-4" />
    </svg>
  );
}

// ----------------------------------------------------
// 33. UpvoteIcon (replacing 👍)
// ----------------------------------------------------
export function UpvoteIcon({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-upvote ${className}`}
      {...props}
    >
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3l3.15-6.3a2.12 2.12 0 0 1 3.5 1.5c0 .94-.28 1.86-.65 2.68Z" />
    </svg>
  );
}

// ----------------------------------------------------
// 34. DownvoteIcon (replacing 👎)
// ----------------------------------------------------
export function DownvoteIcon({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-downvote ${className}`}
      {...props}
    >
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3l-3.15 6.3a2.12 2.12 0 0 1-3.5-1.5c0-.94.28-1.86.65-2.68Z" />
    </svg>
  );
}

// ----------------------------------------------------
// 35. InfoIcon (replacing ℹ️ or ℹ)
// ----------------------------------------------------
export function InfoIcon({ size = 16, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-info ${className}`}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="16" y2="12" />
      <line x1="12" x2="12.01" y1="8" y2="8" />
    </svg>
  );
}

// ----------------------------------------------------
// 36. WireStableLogo (Custom monoline branding icon)
// ----------------------------------------------------
export function WireStableLogo({ size = 32, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon-svg custom-logo-branding ${className}`}
      {...props}
    >
      {/* Segmented Outer Circle (like the reference logo) */}
      <path d="M 30,12 A 40,40 0 0,1 70,12" />
      <path d="M 88,30 A 40,40 0 0,1 88,70" />
      <path d="M 70,88 A 40,40 0 0,1 30,88" />
      <path d="M 12,70 A 40,40 0 0,1 12,30" />

      {/* Top Pillar: Stablecoin ($ sign) */}
      <circle cx="50" cy="36" r="11" />
      <path d="M 50,22 L 50,50" />

      {/* Left Pillar: Remittance / Wave (styled like the bird wave in reference logo) */}
      <path d="M 22,60 C 22,50 36,50 36,60 C 36,70 22,70 22,60 Z" />
      <path d="M 34,60 C 37,57 42,60 45,63" />

      {/* Right Pillar: Security / Shield Lock (styled like the dog head loop in reference logo) */}
      <path d="M 64,60 C 64,50 78,50 78,60 C 78,70 64,70 64,60 Z" />
      <circle cx="71" cy="58" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}


