import PrivacyPage from "./PrivacyClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the WireStable privacy policy to understand how we store email hashes, conversational logs, and handle transaction data.",
  alternates: {
    canonical: "/privacy"
  },
  openGraph: {
    title: "Privacy Policy | WireStable",
    description: "Learn how WireStable handles user data privacy and non-custodial wallet metadata securely.",
    url: "https://wirestable.xyz/privacy",
    type: "website"
  },
  twitter: {
    title: "Privacy Policy | WireStable",
    description: "Learn how WireStable handles user data privacy and non-custodial wallet metadata securely."
  }
};

export default function Page() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Privacy Policy",
      "description": "Privacy policy document for the WireStable platform.",
      "url": "https://wirestable.xyz/privacy"
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
          "name": "Privacy Policy",
          "item": "https://wirestable.xyz/privacy"
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
      <PrivacyPage />
    </>
  );
}
