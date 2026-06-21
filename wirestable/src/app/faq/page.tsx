import FAQPage from "./FaqClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to frequently asked questions about WireStable stablecoin remittance, gasless paymasters on Arc, Circle Smart Wallet security, and Maker-Checker policies.",
  alternates: {
    canonical: "/faq"
  },
  openGraph: {
    title: "Frequently Asked Questions | WireStable",
    description: "Got questions? Find answers on how WireStable handles gasless stablecoin payments, security, and CCTP.",
    url: "https://wirestable.xyz/faq",
    type: "website"
  },
  twitter: {
    title: "Frequently Asked Questions | WireStable",
    description: "Got questions? Find answers on how WireStable handles gasless stablecoin payments, security, and CCTP."
  }
};

export default function Page() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is WireStable?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "WireStable is an AI-first stablecoin remittance platform that enables businesses and individuals to sweep idle treasury assets, stream micro-payments, and execute cross-border payouts using simple natural language."
          }
        },
        {
          "@type": "Question",
          "name": "How does natural language remittance work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our built-in AI parser handles commands like 'transfer 10 USDC to Bob and convert remaining balance to EURC'. It maps entities to public addresses, calculates conversion rates, and sponsors transactions gaslessly."
          }
        },
        {
          "@type": "Question",
          "name": "Is my corporate treasury balance secure?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. WireStable utilizes Circle Developer-Controlled Wallets with multi-party computation (MPC) and strict Maker-Checker approval rules. No single agent can execute transfers without owner signature authorization."
          }
        },
        {
          "@type": "Question",
          "name": "Is my Circle Smart Wallet secure?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We deploy Circle User-Controlled Smart Contract Accounts (SCA) secured via multi-party computation (MPC) and hardware enclaves. Your signature is required to execute transfers. The AI remittance agent only acts as a Maker (drafting intents) while your cryptographic wallet acts as the Checker."
          }
        }
      ]
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
          "name": "FAQ",
          "item": "https://wirestable.xyz/faq"
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
      <FAQPage />
    </>
  );
}
