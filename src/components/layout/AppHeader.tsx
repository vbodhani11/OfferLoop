"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { AppLogo } from "@/components/branding/AppLogo";
import { SimulationBadge } from "@/components/branding/SimulationBadge";
import { ThemeToggle } from "./ThemeToggle";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AppHeader() {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  const handleSignOut = async () => {
    const client = getSupabaseBrowserClient();
    await client?.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-border bg-surface/90 supports-[backdrop-filter]:bg-surface/70 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="focus-ring rounded">
            <AppLogo />
          </Link>
          <DesktopNavigation />
        </div>
        <div className="flex items-center gap-2">
          <SimulationBadge className="hidden md:inline-flex" />
          <ThemeToggle />
          {!loading ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Account menu"
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user ? (
                  <DropdownMenuItem onSelect={handleSignOut}>Sign out</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/sign-in">Sign in</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {!loading && !user ? (
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
          ) : null}
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
