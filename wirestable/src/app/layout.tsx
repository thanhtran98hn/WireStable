import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "WireStable — AI-Powered USDC Remittance on Arc",
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
  ],
  openGraph: {
    title: "WireStable — AI-Powered USDC Remittance",
    description: "Send USDC across borders instantly using natural language.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
