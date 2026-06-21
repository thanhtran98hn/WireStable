import ContactPage from "./ContactClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Support",
  description: "Get in touch with the WireStable team for enterprise partnerships, developer support, custom integration inquiries, or API help.",
  alternates: {
    canonical: "/contact"
  },
  openGraph: {
    title: "Contact Support | WireStable",
    description: "Get in touch with the WireStable team for developer support, custom integrations, or partnerships.",
    url: "https://wirestable.xyz/contact",
    type: "website"
  },
  twitter: {
    title: "Contact Support | WireStable",
    description: "Get in touch with the WireStable team for developer support, custom integrations, or partnerships."
  }
};

export default function Page() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact WireStable Support",
      "description": "Enterprise support channels, social links, and message form for WireStable stablecoin stack support.",
      "url": "https://wirestable.xyz/contact"
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
          "name": "Contact",
          "item": "https://wirestable.xyz/contact"
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
      <ContactPage />
    </>
  );
}
