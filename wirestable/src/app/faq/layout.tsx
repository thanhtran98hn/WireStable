import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | WireStable",
  description: "Find answers about gasless stablecoin payouts, Circle Smart Wallets (SCA), MPC keys, Maker-Checker authorization, and supported stablecoins.",
  alternates: {
    canonical: "https://wirestable.xyz/faq"
  },
  openGraph: {
    title: "Frequently Asked Questions | WireStable",
    description: "Find answers about gasless stablecoin payouts, Circle Smart Wallets (SCA), MPC keys, Maker-Checker authorization, and supported stablecoins.",
    url: "https://wirestable.xyz/faq"
  }
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://wirestable.xyz"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "FAQ",
        "item": "https://wirestable.xyz/faq"
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is WireStable?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "WireStable is an AI-first stablecoin remittance platform that enables businesses and individuals to sweep idle treasury assets, stream micro-payments, and execute cross-border payouts using simple natural language."
        }
      },
      {
        "@type": "Question",
        "name": "How does natural language remittance work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our built-in AI parser processes commands like 'transfer 10 USDC to Bob and convert remaining balance to EURC'. It maps entities to public addresses, calculates conversion rates, and sponsors transactions gaslessly."
        }
      },
      {
        "@type": "Question",
        "name": "Is my corporate treasury balance secure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. WireStable utilizes Circle Developer-Controlled Wallets with multi-party computation (MPC) and strict Maker-Checker approval rules. No single agent can execute transfers without owner signature authorization."
        }
      },
      {
        "@type": "Question",
        "name": "How are transfers completely gasless for the user?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We leverage the native stablecoin transaction sponsorship capabilities of the Arc Chain. When you request a payout, our backend Paymaster API wraps the transfer under ERC-7708 criteria, paying the necessary gas in stablecoins on behalf of the user, abstracting gas tokens completely."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
