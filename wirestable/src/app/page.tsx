import LandingPage from "./LandingClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WireStable — Conversational Stablecoin Remittances & Yield",
  description: "WireStable is an AI-first stablecoin remittance stack. Execute gasless cross-border payouts, yield sweeps, and spot FX hedging using natural language.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "WireStable — Conversational Stablecoin Remittances & Yield",
    description: "Execute gasless cross-border payouts, yield sweeps, and spot FX hedging using natural language on the Arc Network.",
    url: "https://wirestable.xyz",
    type: "website"
  },
  twitter: {
    title: "WireStable — Conversational Stablecoin Remittances & Yield",
    description: "Execute gasless cross-border payouts, yield sweeps, and spot FX hedging using natural language on the Arc Network."
  }
};

export default function Page() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "WireStable",
      "operatingSystem": "All",
      "applicationCategory": "FinanceApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Conversational stablecoin remittance stack powered by Circle Web3 App Kit and Arc Chain."
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "WireStable",
      "url": "https://wirestable.xyz"
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "WireStable",
      "url": "https://wirestable.xyz",
      "logo": "https://wirestable.xyz/logo.png",
      "sameAs": [
        "https://twitter.com/WireStable",
        "https://github.com/wirestable"
      ]
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
