import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corporate Treasury Admin | WireStable",
  description: "Enterprise treasury maker-checker disbursal monitor and yield sweep logs.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
