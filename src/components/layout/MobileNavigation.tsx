"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AppLogo } from "@/components/branding/AppLogo";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

const links = [
  { href: "/accept", label: "Accept Mode" },
  { href: "/reject", label: "Reject Mode" },
  { href: "/offers", label: "My Offers" },
  { href: "/saved", label: "Saved Jobs" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
  { href: "/about", label: "About" },
  { href: "/simulation", label: "Simulation Notice" },
];

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-6">
        <VisuallyHidden>
          <SheetTitle>Navigation menu</SheetTitle>
        </VisuallyHidden>
        <AppLogo />
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {links.map((link) => {
            const isActive =
              pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "focus-ring rounded-[var(--radius-sm)] px-3 py-2.5 text-base font-medium",
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
      </SheetContent>
    </Sheet>
  );
}
