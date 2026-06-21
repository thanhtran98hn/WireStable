"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname() || "";
  
  // Hide bottom navigation bar on landing page and legal documents if they don't want app distractions
  // but keep it on main dashboard, studio and chat apps for speed.
  const links = [
    { label: "Chat", href: "/chat", icon: "💬" },
    { label: "Studio", href: "/agent-studio", icon: "⚡" },
    { label: "Admin", href: "/admin", icon: "🏢" },
    { label: "Docs", href: "/docs", icon: "📖" },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link 
            key={link.href} 
            href={link.href}
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="bottom-nav-icon">{link.icon}</span>
            <span className="bottom-nav-label">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
