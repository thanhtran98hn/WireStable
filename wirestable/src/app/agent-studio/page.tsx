import type { Metadata } from "next";
import { AgentStudioView } from "@/components/AgentStudioView";

export const metadata: Metadata = {
  title: "Agent Sandbox & Studio | WireStable",
  description: "Prompt simulation console, RAG configuration, and memory registers for remittance agents.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AgentStudioPage() {
  return <AgentStudioView />;
}
