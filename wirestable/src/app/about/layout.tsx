import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | WireStable",
  description: "Learn about the mission, protocol values, and hackathon creators behind WireStable's natural-language stablecoin remittance stack.",
  alternates: {
    canonical: "https://wirestable.xyz/about"
  },
  openGraph: {
    title: "About Us | WireStable",
    description: "Learn about the mission, protocol values, and hackathon creators behind WireStable's stablecoin remittance stack.",
    url: "https://wirestable.xyz/about"
  }
};

export default function AboutLayout({
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
        "name": "About",
        "item": "https://wirestable.xyz/about"
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
