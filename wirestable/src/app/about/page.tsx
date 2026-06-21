import AboutPage from "./AboutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Team",
  description: "Learn more about WireStable, our mission to build non-custodial conversational stablecoin interfaces, and the developers behind the project.",
  alternates: {
    canonical: "/about"
  },
  openGraph: {
    title: "About Us | WireStable",
    description: "Learn about the mission and the team behind the WireStable conversational stablecoin commerce stack.",
    url: "https://wirestable.xyz/about",
    type: "website"
  },
  twitter: {
    title: "About Us | WireStable",
    description: "Learn about the mission and the team behind the WireStable conversational stablecoin commerce stack."
  }
};

export default function Page() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About WireStable",
      "description": "Information about the WireStable stablecoin remittance hackathon project and creators.",
      "url": "https://wirestable.xyz/about"
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
          "name": "About",
          "item": "https://wirestable.xyz/about"
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
      <AboutPage />
    </>
  );
}
