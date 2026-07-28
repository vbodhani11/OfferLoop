"use client";

import { useId, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CandidateAvatar } from "./CandidateAvatar";
import {
  MAX_REJECTION_COMMENT_LENGTH,
  REJECTION_REASONS,
  parseRejectionSelection,
  type RejectionReasonCode,
  type RejectionSource,
} from "@/features/reject/services/rejectionReasons";
import type { FictionalCandidate } from "@/types/domain";
import { cn } from "@/lib/utils";

export interface RejectReasonConfirmPayload {
  reasonCode: RejectionReasonCode;
  reasonLabel: string;
  comment?: string;
  source: RejectionSource;
}

function RejectReasonForm({
  candidate,
  source,
  submitting,
  errorMessage,
  onCancel,
  onConfirm,
}: {
  candidate: FictionalCandidate;
  source: RejectionSource;
  submitting: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: (payload: RejectReasonConfirmPayload) => void;
}) {
  const [reasonCode, setReasonCode] = useState<RejectionReasonCode | null>(null);
  const [comment, setComment] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const reasonGroupId = useId();
  const commentId = useId();
  const errorId = useId();
  const firstReasonRef = useRef<HTMLButtonElement>(null);

  const remaining = MAX_REJECTION_COMMENT_LENGTH - comment.length;
  const displayError = localError ?? errorMessage;
  const canConfirm = reasonCode !== null && !submitting;

  function handleConfirm() {
    if (!reasonCode) {
      setLocalError("Select a rejection reason before continuing.");
      return;
    }
    const parsed = parseRejectionSelection({ reasonCode, comment });
    if (!parsed.ok) {
      setLocalError(parsed.message);
      return;
    }
    setLocalError(null);
    onConfirm({
      reasonCode: parsed.reasonCode,
      reasonLabel: parsed.reasonLabel,
      comment: parsed.comment,
      source,
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Why are you rejecting this fictional candidate?</DialogTitle>
        <DialogDescription>
          Choose a job-related reason. No real person will receive this decision.
        </DialogDescription>
      </DialogHeader>

      <div className="border-border bg-surface-muted/40 flex items-center gap-3 rounded-[var(--radius-md)] border p-3">
        <CandidateAvatar
          initials={candidate.initials}
          avatarStyle={candidate.avatarStyle}
          className="h-11 w-11 shrink-0 text-sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-foreground truncate font-medium">
              {candidate.displayName}
            </p>
            <Badge variant="reject" className="shrink-0 text-[10px]">
              Fictional candidate
            </Badge>
          </div>
          <p className="text-muted-foreground line-clamp-1 text-sm">
            {candidate.headline}
          </p>
        </div>
      </div>

      <fieldset
        className="flex flex-col gap-2"
        aria-describedby={displayError ? errorId : undefined}
      >
        <legend className="text-foreground mb-1 text-sm font-medium" id={reasonGroupId}>
          Rejection reason
        </legend>
        <div
          role="radiogroup"
          aria-labelledby={reasonGroupId}
          className="flex flex-col gap-1.5"
        >
          {REJECTION_REASONS.map((reason, index) => {
            const selected = reasonCode === reason.code;
            return (
              <button
                key={reason.code}
                ref={index === 0 ? firstReasonRef : undefined}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={submitting}
                onClick={() => {
                  setReasonCode(reason.code);
                  setLocalError(null);
                }}
                className={cn(
                  "focus-ring flex min-h-11 items-start gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 text-left text-sm transition-colors",
                  selected
                    ? "border-reject bg-reject-muted text-foreground"
                    : "border-border text-muted-foreground hover:border-reject/40 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-reject bg-reject" : "border-border",
                  )}
                  aria-hidden="true"
                >
                  {selected ? (
                    <span className="bg-reject-foreground h-1.5 w-1.5 rounded-full" />
                  ) : null}
                </span>
                <span>{reason.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor={commentId}>Optional fictional hiring note</Label>
        <Textarea
          id={commentId}
          value={comment}
          disabled={submitting}
          maxLength={MAX_REJECTION_COMMENT_LENGTH}
          placeholder="Add a short job-related note for this simulation..."
          aria-describedby={`${commentId}-help ${commentId}-count`}
          className="min-h-24"
          onChange={(event) => {
            setComment(event.target.value);
            setLocalError(null);
          }}
        />
        <div className="text-muted-foreground flex items-start justify-between gap-3 text-xs">
          <p id={`${commentId}-help`}>
            This note is stored only as part of your OfferLoop simulation history.
          </p>
          <p id={`${commentId}-count`} aria-live="polite">
            {remaining} left
          </p>
        </div>
      </div>

      {displayError ? (
        <p id={errorId} role="alert" className="text-danger text-sm">
          {displayError}
        </p>
      ) : null}

      <DialogFooter>
        <Button
          type="button"
          variant="secondary"
          disabled={submitting}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="reject"
          disabled={!canConfirm}
          aria-disabled={!canConfirm}
          onClick={handleConfirm}
        >
          {submitting ? "Saving…" : "Confirm rejection"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function RejectReasonDialog({
  open,
  candidate,
  source,
  submitting,
  errorMessage,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  candidate: FictionalCandidate | null;
  source: RejectionSource;
  submitting: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: (payload: RejectReasonConfirmPayload) => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !submitting) onCancel();
      }}
    >
      <DialogContent
        showClose={!submitting}
        data-testid="reject-reason-dialog"
        className={cn(
          // Mobile: bottom sheet. Desktop: centered dialog.
          "top-auto bottom-0 left-1/2 max-h-[min(92vh,720px)] w-full max-w-lg translate-x-[-50%] translate-y-0 overflow-y-auto rounded-t-[var(--radius-xl)] rounded-b-none pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:top-1/2 sm:bottom-auto sm:translate-y-[-50%] sm:rounded-[var(--radius-lg)] sm:pb-6",
        )}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          const first = document.querySelector(
            '[data-testid="reject-reason-dialog"] [role="radio"]',
          ) as HTMLButtonElement | null;
          first?.focus();
        }}
      >
        {candidate ? (
          <RejectReasonForm
            key={`${candidate.id}-${open ? "open" : "closed"}`}
            candidate={candidate}
            source={source}
            submitting={submitting}
            errorMessage={errorMessage}
            onCancel={onCancel}
            onConfirm={onConfirm}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
