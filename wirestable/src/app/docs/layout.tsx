import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Documentation | WireStable",
  description: "Learn how to integrate the WireStable Payout API, deploy Circle User-Controlled Wallets, and utilize EIP-7708 paymaster transaction sponsorship.",
  keywords: [
    "Circle SDK",
    "Smart Contract Account",
    "SCA",
    "EIP-7708",
    "USDC gas",
    "cross-chain bridge API",
    "developer docs"
  ],
  alternates: {
    canonical: "https://wirestable.xyz/docs"
  },
  openGraph: {
    title: "Developer Documentation | WireStable",
    description: "Learn how to integrate the WireStable Payout API, deploy Circle User-Controlled Wallets, and utilize EIP-7708 paymaster transaction sponsorship.",
    url: "https://wirestable.xyz/docs",
    type: "article"
  }
};

export default function DocsLayout({
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
        "name": "Docs",
        "item": "https://wirestable.xyz/docs"
      }
    ]
  };

  const techArticleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "WireStable Developer Documentation & Integration Guide",
    "description": "Integration guide for Circle User-Controlled Wallets, smart contract payouts, and gasless transaction sponsorship on Arc chain.",
    "inLanguage": "en",
    "publisher": {
      "@type": "Organization",
      "name": "WireStable",
      "logo": {
        "@type": "ImageObject",
        "url": "https://wirestable.xyz/next.svg"
      }
    },
    "mainEntityOfPage": "https://wirestable.xyz/docs",
    "dependencies": "Circle Programmable Wallets SDK, Viem, Next.js App Router"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleSchema) }}
      />
      {children}
    </>
  );
}
