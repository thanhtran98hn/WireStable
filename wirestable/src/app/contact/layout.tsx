import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Support | WireStable",
  description: "Get in touch with the WireStable protocol support team, integration engineers, or open repository feedback channels.",
  alternates: {
    canonical: "https://wirestable.xyz/contact"
  },
  openGraph: {
    title: "Contact Support | WireStable",
    description: "Get in touch with the WireStable protocol support team, integration engineers, or open repository feedback channels.",
    url: "https://wirestable.xyz/contact"
  }
};

export default function ContactLayout({
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
        "name": "Contact",
        "item": "https://wirestable.xyz/contact"
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
