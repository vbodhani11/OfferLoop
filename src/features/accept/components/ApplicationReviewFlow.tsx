"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileText, ScanSearch, Sparkles, Send, BadgeCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { useRepositories } from "@/lib/repositories/useRepositories";
import { useGuestSession } from "@/lib/context/GuestSessionContext";
import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";
import { generateFictionalStartDate, generateOfferMessage } from "@/lib/formatting/offer";
import { recordOfferReceivedMilestone } from "@/lib/storage/pwaMilestone";
import type { CreateOfferInput } from "@/lib/repositories/types";
import type { JobWithOrganization, Offer } from "@/types/domain";
import { OfferCelebration } from "./OfferCelebration";

const STAGES = [
  { label: "Opening your fictional application", icon: FileText },
  { label: "Reviewing your simulated experience", icon: ScanSearch },
  { label: "Matching your imaginary strengths", icon: Sparkles },
  { label: "Sending the file to an imaginary hiring manager", icon: Send },
  { label: "Preparing your fictional decision", icon: BadgeCheck },
] as const;

const STAGE_DURATION_MS = 750;
const REDUCED_STAGE_DURATION_MS = 120;

function buildOfferInput(
  job: JobWithOrganization,
  displayName: string,
  applicationId: string | null,
): CreateOfferInput {
  return {
    jobId: job.id,
    applicationId,
    recipientDisplayName: displayName,
    fictionalStartDate: generateFictionalStartDate(job.id),
    fictionalManagerName: job.fictionalManagerName,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    signingBonus: job.signingBonus,
    currency: job.currency,
    workArrangement: job.workArrangement,
    offerMessage: generateOfferMessage(
      { title: job.title, organizationName: job.organization.name },
      displayName,
    ),
    simulationVersion: "1.0.0",
  };
}

export function ApplicationReviewFlow({ job }: { job: JobWithOrganization }) {
  const { repositories, userId } = useRepositories();
  const { anonymousSessionId, displayName } = useGuestSession();
  const reducedMotion = usePrefersReducedMotion();

  const [phase, setPhase] = useState<"checking" | "reviewing" | "done">("checking");
  const [stageIndex, setStageIndex] = useState(0);
  const [skipRequested, setSkipRequested] = useState(false);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const hasSubmitted = useRef(false);

  const attemptSave = useCallback(async () => {
    setSaving(true);
    setSaveError(false);
    try {
      const application = await repositories.applications.createApplication(
        userId,
        job.id,
      );
      const createdOffer = await repositories.offers.createOffer(
        userId,
        buildOfferInput(job, displayName, application.id),
      );
      await repositories.actions.recordAction({
        userId: userId === "guest" ? null : userId,
        anonymousSessionId,
        actionType: "job_applied",
        jobId: job.id,
      });
      await repositories.actions.recordAction({
        userId: userId === "guest" ? null : userId,
        anonymousSessionId,
        actionType: "offer_created",
        jobId: job.id,
      });
      setOffer(createdOffer);
      setSaveError(false);
    } catch {
      const now = new Date().toISOString();
      const previewInput = buildOfferInput(job, displayName, null);
      setOffer({
        id: `preview-${job.id}`,
        userId,
        jobId: job.id,
        applicationId: previewInput.applicationId,
        recipientDisplayName: previewInput.recipientDisplayName,
        fictionalStartDate: previewInput.fictionalStartDate,
        fictionalManagerName: previewInput.fictionalManagerName,
        salaryMin: previewInput.salaryMin,
        salaryMax: previewInput.salaryMax,
        signingBonus: previewInput.signingBonus,
        currency: previewInput.currency,
        workArrangement: previewInput.workArrangement,
        offerMessage: previewInput.offerMessage,
        simulationVersion: previewInput.simulationVersion,
        createdAt: now,
      });
      setSaveError(true);
    } finally {
      setSaving(false);
      setPhase("done");
      recordOfferReceivedMilestone();
    }
  }, [repositories, userId, job, displayName, anonymousSessionId]);

  // Duplicate-application guard: if an offer already exists for this job,
  // skip the review animation entirely and reopen it.
  useEffect(() => {
    let active = true;
    (async () => {
      const existing = await repositories.offers.getOfferByJobId(userId, job.id);
      if (!active) return;
      if (existing) {
        setOffer(existing);
        setPhase("done");
      } else {
        setPhase("reviewing");
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for this job
  }, [job.id]);

  useEffect(() => {
    if (phase !== "reviewing") return;

    if (skipRequested) {
      if (!hasSubmitted.current) {
        hasSubmitted.current = true;
        void attemptSave();
      }
      return;
    }

    const duration = reducedMotion ? REDUCED_STAGE_DURATION_MS : STAGE_DURATION_MS;
    const timer = setTimeout(() => {
      if (stageIndex < STAGES.length - 1) {
        setStageIndex((index) => index + 1);
      } else if (!hasSubmitted.current) {
        hasSubmitted.current = true;
        void attemptSave();
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [phase, stageIndex, skipRequested, reducedMotion, attemptSave]);

  if (phase === "checking") {
    return (
      <PageContainer className="flex min-h-[60vh] items-center justify-center py-10">
        <p className="text-muted-foreground text-sm">
          Loading your fictional application…
        </p>
      </PageContainer>
    );
  }

  if (phase === "done" && offer) {
    return (
      <OfferCelebration
        offer={offer}
        job={job}
        saveError={saveError}
        saving={saving}
        onRetrySave={attemptSave}
      />
    );
  }

  return (
    <PageContainer className="flex min-h-[70vh] flex-col items-center justify-center gap-8 py-10 text-center">
      <span className="bg-brand-muted text-brand inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Simulation in progress
      </span>

      <div className="flex flex-col items-center gap-2">
        <h1 className="text-foreground text-2xl font-semibold sm:text-3xl">
          Reviewing your application for {job.title}
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">
          {job.organization.name} is a fictional company. This entire review is part of
          the OfferLoop entertainment simulation.
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-3">
        {STAGES.map((stage, index) => {
          const isComplete =
            index < stageIndex || (index === stageIndex && skipRequested);
          const isActive = index === stageIndex && !skipRequested;
          const Icon = stage.icon;
          return (
            <div
              key={stage.label}
              className={`flex items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors ${
                isComplete
                  ? "border-accept/40 bg-accept-muted text-accept"
                  : isActive
                    ? "border-brand/40 bg-brand-muted text-brand"
                    : "border-border bg-surface text-muted-foreground"
              }`}
            >
              <span className="bg-surface flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                {isComplete ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <motion.span
                    animate={isActive && !reducedMotion ? { rotate: 360 } : undefined}
                    transition={
                      isActive && !reducedMotion
                        ? { duration: 1.4, repeat: Infinity, ease: "linear" }
                        : undefined
                    }
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </motion.span>
                )}
              </span>
              <span className="text-sm font-medium">{stage.label}</span>
            </div>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        {skipRequested
          ? "Finishing your fictional application review."
          : STAGES[stageIndex]?.label}
      </p>

      <Button
        type="button"
        variant="secondary"
        onClick={() => setSkipRequested(true)}
        disabled={skipRequested}
      >
        Skip animation
      </Button>
    </PageContainer>
  );
}
