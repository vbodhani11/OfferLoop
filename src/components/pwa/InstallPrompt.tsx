"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";
import {
  dismissInstallPrompt,
  hasReachedInstallMilestone,
  markAppInstalled,
} from "@/lib/storage/pwaMilestone";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * A quiet, dismissible install suggestion. Never shown until the visitor has
 * meaningfully used OfferLoop (one fictional offer, or a few Reject Mode
 * decisions) — see `hasReachedInstallMilestone`. Dismissal is remembered.
 */
export function InstallPrompt() {
  const reducedMotion = usePrefersReducedMotion();
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredEvent(event as BeforeInstallPromptEvent);
      if (hasReachedInstallMilestone()) {
        setVisible(true);
        trackEvent("pwa_install_prompt_shown");
      }
    };

    const handleAppInstalled = () => {
      markAppInstalled();
      setVisible(false);
      trackEvent("pwa_installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    const { outcome } = await deferredEvent.userChoice;
    if (outcome === "accepted") markAppInstalled();
    setVisible(false);
    setDeferredEvent(null);
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="dialog"
          aria-label="Install OfferLoop"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.3 }}
          className="border-border bg-surface fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-soft-lg)] sm:inset-x-auto sm:right-4"
        >
          <div className="bg-brand-muted text-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
            <Download className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-foreground text-sm font-medium">Install OfferLoop</p>
            <p className="text-muted-foreground text-xs">
              Add it to your home screen for quicker access to the simulation.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Button type="button" size="sm" variant="primary" onClick={handleInstall}>
              Install
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              aria-label="Dismiss install suggestion"
              onClick={handleDismiss}
            >
              <X className="h-3.5 w-3.5" /> Not now
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
