"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  children?: React.ReactNode;
  logoText?: string;
  logoIcon?: string;
}

export function Navbar({ children, logoText, logoIcon }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname() || "";

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Accessibility: close mobile menu when Escape is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Close mobile menu on path changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);


  // Determine site branding based on route
  const getBranding = () => {
    if (logoText && logoIcon) {
      return { text: logoText, icon: logoIcon };
    }
    if (pathname.startsWith("/admin")) {
      return { text: "Enterprise Treasury", icon: "🏢" };
    }
    if (pathname.startsWith("/agent-studio")) {
      return { text: "AgentOS Studio", icon: "⚡" };
    }
    if (pathname.startsWith("/faq")) {
      return { text: "WireFAQ", icon: "❓" };
    }
    if (pathname.startsWith("/docs")) {
      return { text: "WireDocs", icon: "📖" };
    }
    if (pathname.startsWith("/contact")) {
      return { text: "WireContact", icon: "✉️" };
    }
    if (pathname.startsWith("/about")) {
      return { text: "WireAbout", icon: "🏢" };
    }
    if (pathname.startsWith("/privacy")) {
      return { text: "WirePrivacy", icon: "🔒" };
    }
    if (pathname.startsWith("/terms")) {
      return { text: "WireTerms", icon: "📄" };
    }
    return { text: "WireStable", icon: "W$" };
  };

  const branding = getBranding();

  // Primary navigation links for landing and info pages
  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Docs", href: "/docs" },
    { label: "FAQ", href: "/faq" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  // Check if we are on landing/info pages that display the horizontal link navbar
  const isMarketingPage =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/faq" ||
    pathname === "/contact" ||
    pathname === "/docs" ||
    pathname === "/privacy" ||
    pathname === "/terms";

  return (
    <header className="app-header" style={{ position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(16px)", borderBottom: "1px solid var(--color-border)", background: "rgba(5, 6, 11, 0.85)" }}>
      <div className="app-header-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", position: "relative" }}>
        
        {/* Logo and Branding */}
        <Link href="/" style={{ textDecoration: "none", zIndex: 110 }}>
          <div className="app-logo">
            <div className="app-logo-icon" style={{ background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-light) 100%)", color: "var(--color-text-inverse)", width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.1rem" }}>
              {branding.icon}
            </div>
            <div className="app-logo-text" style={{ fontSize: "1.125rem", fontWeight: "bold", color: "var(--color-text-primary)" }}>
              {branding.text.split(" ")[0]}
              {branding.text.split(" ")[1] && (
                <span style={{ color: "var(--color-accent)" }}>{branding.text.split(" ")[1]}</span>
              )}
            </div>
          </div>
        </Link>

        {/* Desktop Links (Marketing pages only) */}
        {isMarketingPage && (
          <nav style={{ display: "flex", gap: "24px", fontSize: "0.875rem" }} className="hidden md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: pathname === link.href ? "var(--color-accent)" : "var(--color-text-secondary)",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "color 0.2s ease"
                }}
                className="hover:text-[var(--color-accent)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Desktop Custom Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }} className="hidden md:flex">
          {children}
        </div>

        {/* Responsive Mobile Burger Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--color-text-primary)",
            cursor: "pointer",
            padding: "8px",
            display: "none",
            flexDirection: "column",
            gap: "5px",
            zIndex: 110,
            justifyContent: "center",
            height: "40px",
            width: "40px",
            borderRadius: "8px",
          }}
          className="flex md:hidden hover:bg-white/5 active:scale-95 transition-all"
          aria-label="Toggle Navigation Menu"
          aria-expanded={isOpen}
          aria-controls="mobile-nav-drawer"
        >
          <span style={{ display: "block", width: "20px", height: "2px", background: "currentColor", transform: isOpen ? "rotate(45deg) translate(5px, 5px)" : "none", transition: "transform 0.2s ease" }} />
          <span style={{ display: "block", width: "20px", height: "2px", background: "currentColor", opacity: isOpen ? 0 : 1, transition: "opacity 0.2s ease" }} />
          <span style={{ display: "block", width: "20px", height: "2px", background: "currentColor", transform: isOpen ? "rotate(-45deg) translate(5px, -5px)" : "none", transition: "transform 0.2s ease" }} />
        </button>

        {/* Mobile Navigation Drawer Overlay */}
        {isOpen && (
          <div
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              height: "100dvh",
              background: "rgba(5, 6, 11, 0.98)",
              backdropFilter: "blur(20px)",
              zIndex: 105,
              display: "flex",
              flexDirection: "column",
              paddingTop: "calc(80px + env(safe-area-inset-top))",
              paddingLeft: "calc(24px + env(safe-area-inset-left))",
              paddingRight: "calc(24px + env(safe-area-inset-right))",
              paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
              gap: "24px",
              animation: "fadeIn 0.2s ease",
              overflowY: "auto",
            }}
          >
            {/* Mobile Nav Links for Marketing Pages */}
            {isMarketingPage && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderBottom: "1px solid var(--color-border)", paddingBottom: "20px" }}>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    style={{
                      color: pathname === link.href ? "var(--color-accent)" : "var(--color-text-primary)",
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile Action Buttons (Passed from Parent) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "100%",
                alignItems: "stretch",
              }}
              onClick={(e) => {
                // If a button is clicked, close the menu, but don't close if clicking modal triggers
                if ((e.target as HTMLElement).tagName === "BUTTON" || (e.target as HTMLElement).tagName === "A") {
                  setIsOpen(false);
                }
              }}
            >
              {children}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
