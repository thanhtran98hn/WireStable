import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Studio Control OS | WireStable",
  description: "Configure developer paymasters, monitor RAG memory scopes, and inspect AML audit rules.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AgentStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
