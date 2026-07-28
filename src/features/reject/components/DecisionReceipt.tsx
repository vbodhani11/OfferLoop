"use client";

import { motion } from "framer-motion";
import { Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RejectionDetails } from "@/features/reject/services/rejectionReasons";
import { cn } from "@/lib/utils";

export interface DecisionReceiptData {
  candidateDisplayName: string;
  rejection: RejectionDetails;
  playfulLine: string;
}

export function DecisionReceipt({
  receipt,
  reducedMotion,
  onUndo,
  onDismiss,
  className,
}: {
  receipt: DecisionReceiptData;
  reducedMotion: boolean;
  onUndo: () => void;
  onDismiss: () => void;
  className?: string;
}) {
  const { candidateDisplayName, rejection, playfulLine } = receipt;

  return (
    <motion.aside
      data-testid="decision-receipt"
      role="status"
      aria-live="polite"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
      transition={{ duration: reducedMotion ? 0.12 : 0.28, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "border-border bg-surface relative w-full rounded-[var(--radius-md)] border p-4 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <button
        type="button"
        onClick={onDismiss}
        className="focus-ring text-muted-foreground hover:bg-surface-muted absolute top-3 right-3 rounded-[var(--radius-sm)] p-1"
        aria-label="Dismiss decision receipt"
      >
        <X className="h-4 w-4" />
      </button>

      <p className="text-reject text-xs font-semibold tracking-wide uppercase">
        Candidate rejected
      </p>
      <p className="text-foreground mt-1 text-base font-semibold">
        {candidateDisplayName}
      </p>

      <dl className="mt-3 flex flex-col gap-1 text-sm">
        <div className="flex flex-col gap-0.5">
          <dt className="text-muted-foreground text-xs">Reason</dt>
          <dd className="text-foreground font-medium">{rejection.reasonLabel}</dd>
        </div>
        {rejection.comment ? (
          <div className="mt-2 flex flex-col gap-0.5">
            <dt className="text-muted-foreground text-xs">Fictional note</dt>
            <dd className="text-foreground whitespace-pre-wrap">{rejection.comment}</dd>
          </div>
        ) : null}
      </dl>

      <p className="text-muted-foreground mt-3 text-sm">
        Will not move forward in this fictional hiring process.
      </p>
      <p className="text-muted-foreground text-xs">No real person was affected.</p>

      <p className="text-foreground mt-3 text-sm italic">{playfulLine}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onUndo}>
          <Undo2 className="h-4 w-4" /> Undo
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </motion.aside>
  );
}
