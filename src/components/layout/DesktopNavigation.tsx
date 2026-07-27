"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/accept", label: "Accept Mode" },
  { href: "/reject", label: "Reject Mode" },
  { href: "/offers", label: "My Offers" },
  { href: "/about", label: "About" },
];

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "focus-ring rounded-[var(--radius-sm)] px-3.5 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-surface-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
