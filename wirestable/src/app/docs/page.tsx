import DocsPage from "./DocsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Integration Documentation",
  description: "Learn how to integrate the WireStable AI-First stablecoin remittance stack, set up Circle Smart Wallets, use CCTP cross-chain bridges, and run gasless payloads.",
  alternates: {
    canonical: "/docs"
  },
  openGraph: {
    title: "Developer Documentation | WireStable",
    description: "API specs, setup commands, and guides to integrate Circle Programmable Wallets and Arc Chain gas sponsorship.",
    url: "https://wirestable.xyz/docs",
    type: "article"
  },
  twitter: {
    title: "Developer Documentation | WireStable",
    description: "API specs, setup commands, and guides to integrate Circle Programmable Wallets and Arc Chain gas sponsorship."
  }
};

export default function Page() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": "WireStable Developer Integration Documentation",
      "description": "Integration guide for Circle Programmable Wallets, CCTP, and Arc Chain gasless stablecoin payment flows.",
      "url": "https://wirestable.xyz/docs",
      "author": {
        "@type": "Organization",
        "name": "WireStable"
      },
      "inLanguage": "en-US"
    },
    {
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
          "name": "Documentation",
          "item": "https://wirestable.xyz/docs"
        }
      ]
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DocsPage />
    </>
  );
}
