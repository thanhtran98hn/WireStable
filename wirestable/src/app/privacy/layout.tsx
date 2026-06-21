import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | WireStable",
  description: "Read the Privacy Policy of WireStable to understand how we store keys, handle user metadata, and safeguard MPC transaction data.",
  alternates: {
    canonical: "https://wirestable.xyz/privacy"
  },
  openGraph: {
    title: "Privacy Policy | WireStable",
    description: "Read the Privacy Policy of WireStable to understand how we store keys, handle user metadata, and safeguard MPC transaction data.",
    url: "https://wirestable.xyz/privacy"
  }
};

export default function PrivacyLayout({
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
        "name": "Privacy Policy",
        "item": "https://wirestable.xyz/privacy"
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
