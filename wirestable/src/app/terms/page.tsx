import TermsPage from "./TermsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the WireStable terms of service to understand non-custodial responsibilities, AML compliance policies, and testnet usage clauses.",
  alternates: {
    canonical: "/terms"
  },
  openGraph: {
    title: "Terms of Service | WireStable",
    description: "Read the terms of service governing usage of the WireStable platform and remittance systems.",
    url: "https://wirestable.xyz/terms",
    type: "website"
  },
  twitter: {
    title: "Terms of Service | WireStable",
    description: "Read the terms of service governing usage of the WireStable platform and remittance systems."
  }
};

export default function Page() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Terms of Service",
      "description": "Terms of service agreements for the WireStable remittance platform.",
      "url": "https://wirestable.xyz/terms"
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
          "name": "Terms of Service",
          "item": "https://wirestable.xyz/terms"
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
      <TermsPage />
    </>
  );
}
