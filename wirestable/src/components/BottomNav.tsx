"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatIcon, BoltIcon, BuildingIcon, DocsIcon } from "@/components/icons/CustomIcons";

export function BottomNav() {
  const pathname = usePathname() || "";
  
  // Hide bottom navigation bar on landing page and legal documents if they don't want app distractions
  // but keep it on main dashboard, studio and chat apps for speed.
  const links = [
    { label: "Chat", href: "/chat", icon: <ChatIcon size={20} /> },
    { label: "Studio", href: "/agent-studio", icon: <BoltIcon size={20} /> },
    { label: "Admin", href: "/admin", icon: <BuildingIcon size={20} /> },
    { label: "Docs", href: "/docs", icon: <DocsIcon size={20} /> },
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
