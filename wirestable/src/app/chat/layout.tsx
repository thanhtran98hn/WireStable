import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat & Remit Workspace | WireStable",
  description: "Conversational client application. Send USDC and EURC instantly.",
  robots: {
    index: false,
    follow: false
  }
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
