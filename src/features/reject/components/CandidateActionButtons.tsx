"use client";

import { motion } from "framer-motion";
import { Check, ListFilter, Mail, X, type LucideIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { DeckDecision, FictionalCandidate } from "@/types/domain";

interface ActionConfig {
  decision: DeckDecision;
  label: string;
  icon: LucideIcon;
  variant: ButtonProps["variant"];
  hint: string;
  ariaLabel: (displayName: string) => string;
}

const ACTIONS: ActionConfig[] = [
  {
    decision: "reject",
    label: "Reject",
    icon: X,
    variant: "reject",
    hint: "← Reject",
    ariaLabel: (name) => `Reject ${name}`,
  },
  {
    decision: "offer",
    label: "Offer",
    icon: Mail,
    variant: "primary",
    hint: "↑ Offer",
    ariaLabel: (name) => `Send simulated offer to ${name}`,
  },
  {
    decision: "shortlist",
    label: "Shortlist",
    icon: Check,
    variant: "accept",
    hint: "→ Shortlist",
    ariaLabel: (name) => `Shortlist ${name}`,
  },
];

export function CandidateActionButtons({
  candidate,
  onDecide,
  onChooseRejectReason,
  quickRejectionEnabled = false,
  disabled,
}: {
  candidate: FictionalCandidate;
  onDecide: (decision: DeckDecision) => void;
  /** Opens the full rejection-reason dialog even when quick rejection is on. */
  onChooseRejectReason?: () => void;
  quickRejectionEnabled?: boolean;
  disabled: boolean;
}) {
  return (
    <div
      data-testid="candidate-action-buttons"
      className="flex w-full max-w-[540px] flex-col items-center gap-2"
    >
      <div className="flex w-full items-center justify-center gap-3 sm:gap-4">
        {ACTIONS.map(({ decision, label, icon: Icon, variant, hint, ariaLabel }) => (
          <div
            key={decision}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5 sm:flex-none"
          >
            <motion.div
              whileTap={disabled ? undefined : { scale: 0.92 }}
              className="inline-flex w-full justify-center sm:w-auto"
            >
              <Button
                type="button"
                variant={variant}
                size="lg"
                className="h-11 min-h-11 w-full min-w-[5.5rem] rounded-full px-4 sm:min-w-[7rem]"
                aria-label={ariaLabel(candidate.displayName)}
                disabled={disabled}
                onClick={() => onDecide(decision)}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </Button>
            </motion.div>
            <kbd
              className="text-muted-foreground border-border bg-surface-muted hidden rounded-[var(--radius-sm)] border px-1.5 py-0.5 font-mono text-[10px] sm:inline-block"
              aria-hidden="true"
            >
              {hint}
            </kbd>
          </div>
        ))}
      </div>

      {quickRejectionEnabled && onChooseRejectReason ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={onChooseRejectReason}
          aria-label={`Choose rejection reason for ${candidate.displayName}`}
        >
          <ListFilter className="h-4 w-4" aria-hidden="true" />
          Choose reason
        </Button>
      ) : null}
    </div>
  );
}
