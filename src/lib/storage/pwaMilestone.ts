import { z } from "zod";
import { STORAGE_KEYS } from "@/lib/constants/storageKeys";
import { safeReadLocalStorage, safeWriteLocalStorage } from "./safeLocalStorage";

const milestoneSchema = z.object({
  offersReceived: z.number().int().nonnegative(),
  recruitingDecisions: z.number().int().nonnegative(),
  dismissed: z.boolean(),
  installed: z.boolean(),
});

type Milestone = z.infer<typeof milestoneSchema>;

const DEFAULT_MILESTONE: Milestone = {
  offersReceived: 0,
  recruitingDecisions: 0,
  dismissed: false,
  installed: false,
};

function read(): Milestone {
  return safeReadLocalStorage(
    STORAGE_KEYS.pwaMilestone,
    milestoneSchema,
    DEFAULT_MILESTONE,
  );
}

function write(partial: Partial<Milestone>): void {
  safeWriteLocalStorage(STORAGE_KEYS.pwaMilestone, { ...read(), ...partial });
}

export function recordOfferReceivedMilestone(): void {
  write({ offersReceived: read().offersReceived + 1 });
}

export function recordRecruitingDecisionMilestone(): void {
  write({ recruitingDecisions: read().recruitingDecisions + 1 });
}

export function dismissInstallPrompt(): void {
  write({ dismissed: true });
}

export function markAppInstalled(): void {
  write({ installed: true });
}

/**
 * "Meaningful usage" gate for the PWA install suggestion: at least one
 * completed fictional application, or a handful of Reject Mode decisions —
 * never shown to a brand-new visitor.
 */
export function hasReachedInstallMilestone(): boolean {
  const milestone = read();
  if (milestone.dismissed || milestone.installed) return false;
  return milestone.offersReceived >= 1 || milestone.recruitingDecisions >= 3;
}
