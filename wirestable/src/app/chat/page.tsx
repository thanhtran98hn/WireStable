import ChatClient from "./ChatClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Remittance Chat App",
  description: "Initiate gasless stablecoin payouts and manage automated yield routing via natural language chat.",
  robots: {
    index: false,
    follow: false
  }
};

export default function Page() {
  return <ChatClient />;
}
