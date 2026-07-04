"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IdeaIcon, BoltIcon, DocsIcon, BrainIcon, MailIcon } from "@/components/icons/CustomIcons";

interface RelatedItem {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export function RelatedContent() {
  const pathname = usePathname() || "";
  
  // Define recommendations maps
  let items: RelatedItem[] = [];

  if (pathname.includes("/docs")) {
    items = [
      {
        title: "Frequently Asked Questions",
        description: "Got questions on Smart Wallets, Paymasters, or network security? Read the FAQ.",
        href: "/faq",
        icon: <IdeaIcon size={20} />
      },
      {
        title: "Launch Chat Interface",
        description: "Want to try natural-language remittance? Launch the chat workspace.",
        href: "/chat",
        icon: <BoltIcon size={20} />
      }
    ];
  } else if (pathname.includes("/faq")) {
    items = [
      {
        title: "Developer Documentation",
        description: "Integrate our Payout APIs and Circle smart contract wallets directly.",
        href: "/docs",
        icon: <DocsIcon size={20} />
      },
      {
        title: "Meet the Team",
        description: "Read about our hackathon mission to make programmable stablecoins human-friendly.",
        href: "/about",
        icon: <BrainIcon size={20} />
      }
    ];
  } else if (pathname.includes("/about")) {
    items = [
      {
        title: "Contact Protocol Support",
        description: "Need custom enterprise integrations? Get in touch with our engineers.",
        href: "/contact",
        icon: <MailIcon size={20} />
      },
      {
        title: "Developer Integration Docs",
        description: "Review implementation parameters, code scripts, and paymaster code snippets.",
        href: "/docs",
        icon: <DocsIcon size={20} />
      }
    ];
  } else if (pathname.includes("/contact")) {
    items = [
      {
        title: "Read our FAQ",
        description: "Find instant answers about security compliance and Supported stablecoins.",
        href: "/faq",
        icon: <IdeaIcon size={20} />
      },
      {
        title: "Platform Mission & Team",
        description: "Learn who is building WireStable and why we sponsor transaction fees.",
        href: "/about",
        icon: <BrainIcon size={20} />
      }
    ];
  } else if (pathname.includes("/privacy") || pathname.includes("/terms")) {
    items = [
      {
        title: "Corporate Contact Support",
        description: "Have legal, compliance, or data custody questions? Send us a message.",
        href: "/contact",
        icon: <MailIcon size={20} />
      },
      {
        title: "Smart Wallet FAQ",
        description: "Learn how MPC key fragments and hardware enclaves protect user balances.",
        href: "/faq",
        icon: <IdeaIcon size={20} />
      }
    ];
  } else {
    // Default fallback (e.g. Homepage or others)
    items = [
      {
        title: "Developer Documentation",
        description: "Review implementation guides, API endpoints, and smart wallet codes.",
        href: "/docs",
        icon: <DocsIcon size={20} />
      },
      {
        title: "Conversational Remittance Stack",
        description: "Experience EIP-7708 gasless payouts settled in real-time.",
        href: "/chat",
        icon: <BoltIcon size={20} />
      }
    ];
  }

  return (
    <div className="related-content-section" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-6)", marginTop: "var(--space-6)" }}>
      <h3 style={{ fontSize: "1.125rem", fontWeight: 800, marginBottom: "16px", color: "var(--color-text-primary)" }}>
        Adjacent Resources & Next Steps
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }} className="md:grid-cols-2">
        {items.map((item) => (
          <Link 
            key={item.href}
            href={item.href}
            className="related-item-card card hover:border-primary"
            style={{ 
              display: "flex", 
              gap: "14px", 
              padding: "16px", 
              textDecoration: "none", 
              color: "inherit",
              alignItems: "flex-start",
              transition: "border-color 0.2s ease, transform 0.2s ease"
            }}
          >
            <div style={{ 
              fontSize: "1.5rem", 
              background: "var(--color-bg-secondary)", 
              width: "42px", 
              height: "42px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              flexShrink: 0
            }}>
              {item.icon}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <strong style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>{item.title}</strong>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.4, margin: 0 }}>
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
