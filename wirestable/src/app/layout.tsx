import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://wirestable.xyz"),
  title: {
    default: "WireStable — AI-Powered USDC Remittance Stack on Arc",
    template: "%s | WireStable"
  },
  description:
    "Send USDC across borders instantly using natural language. Chat, speak, or type your transfer instructions. Powered by Circle & Arc Network.",
  keywords: [
    "USDC",
    "remittance",
    "cross-border payments",
    "Arc Testnet",
    "Circle",
    "stablecoin",
    "AI",
    "chat",
    "gasless payments",
    "treasury automation"
  ],
  alternates: {
    canonical: "./"
  },
  openGraph: {
    title: "WireStable — AI-Powered USDC Remittance",
    description: "Send USDC across borders instantly using natural language. Gasless transactions powered by Circle and Arc.",
    type: "website",
    url: "https://wirestable.xyz",
    siteName: "WireStable",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "WireStable — AI-Powered USDC Remittance",
    description: "Send USDC across borders instantly using natural language.",
    creator: "@WireStable"
  },
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WireStable",
    "url": "https://wirestable.xyz",
    "logo": "https://wirestable.xyz/next.svg",
    "sameAs": [
      "https://x.com/WireStable",
      "https://github.com/wirestable/remittance-stack"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "WireStable",
    "url": "https://wirestable.xyz",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://wirestable.xyz/docs?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#05060b" />
        
        {/* Render Structured Schemas Server-Side */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <Providers>
          {children}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}

