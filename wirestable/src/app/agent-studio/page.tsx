import type { Metadata } from "next";
import { AgentStudioView } from "@/components/AgentStudioView";

export const metadata: Metadata = {
  title: "Agent Studio | WireStable",
  description: "Prompt execution console, RAG configuration, and memory registers for remittance agents.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AgentStudioPage() {
  return <AgentStudioView />;
}
