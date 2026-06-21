import AdminPage from "./AdminClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corporate Admin Dashboard",
  description: "Manage treasury balances, submit maker-checker payout batches, and configure automated yield sweeping parameters.",
  robots: {
    index: false,
    follow: false
  }
};

export default function Page() {
  return <AdminPage />;
}
