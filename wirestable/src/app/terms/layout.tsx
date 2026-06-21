import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | WireStable",
  description: "Review the Terms of Service for WireStable. Detail terms for on-chain remittance, smart contracts execution, and gas sponsorship rules.",
  alternates: {
    canonical: "https://wirestable.xyz/terms"
  },
  openGraph: {
    title: "Terms of Service | WireStable",
    description: "Review the Terms of Service for WireStable. Detail terms for on-chain remittance, smart contracts execution, and gas sponsorship rules.",
    url: "https://wirestable.xyz/terms"
  }
};

export default function TermsLayout({
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
        "name": "Terms of Service",
        "item": "https://wirestable.xyz/terms"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
