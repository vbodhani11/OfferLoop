"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MotionPreferenceProvider } from "@/lib/motion/MotionPreferenceContext";
import { GuestSessionProvider } from "@/lib/context/GuestSessionContext";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import { GuestMigrationPrompt } from "@/features/guest-migration/GuestMigrationPrompt";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MotionPreferenceProvider>
        <GuestSessionProvider>
          <TooltipProvider delayDuration={200}>
            {children}
            <ToastProvider />
            <GuestMigrationPrompt />
          </TooltipProvider>
        </GuestSessionProvider>
      </MotionPreferenceProvider>
    </ThemeProvider>
  );
}
