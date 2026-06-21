"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbsProps {
  items?: { label: string; url: string }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  let allItems: { label: string; href: string }[] = [];

  if (items && items.length > 0) {
    allItems = [
      { label: "Home", href: "/" },
      ...items.map(item => ({ label: item.label, href: item.url }))
    ];
  } else if (pathname && pathname !== "/") {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs = paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");
      const label = path
        .replace(/-/g, " ")
        .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
      
      return { label, href };
    });
    allItems = [{ label: "Home", href: "/" }, ...breadcrumbs];
  }

  if (allItems.length <= 1) return null;

  // Schema.org BreadcrumbList JSON-LD
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://wirestable.xyz${item.href}`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className="breadcrumbs-container">
        <ol className="breadcrumbs-list" style={{ display: "flex", flexWrap: "wrap", listStyle: "none", padding: 0, margin: "0 0 var(--space-4) 0", gap: "8px", fontSize: "0.8125rem", alignItems: "center" }}>
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={item.href} style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-secondary)" }}>
                {index > 0 && <span aria-hidden="true" style={{ color: "var(--color-text-tertiary)", userSelect: "none" }}>/</span>}
                {isLast ? (
                  <span aria-current="page" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="breadcrumb-link" style={{ color: "var(--color-text-secondary)", textDecoration: "none", transition: "color 0.2s ease" }}>
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <style jsx global>{`
        .breadcrumb-link:hover {
          color: var(--color-primary) !important;
          text-decoration: underline !important;
        }
      `}</style>
    </>
  );
}

