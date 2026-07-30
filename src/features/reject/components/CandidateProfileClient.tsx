"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Briefcase,
  Calendar,
  Check,
  ChevronLeft,
  GraduationCap,
  Mail,
  MapPin,
  X,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CandidateAvatar } from "./CandidateAvatar";
import {
  RejectReasonDialog,
  type RejectReasonConfirmPayload,
} from "./RejectReasonDialog";
import { formatSalaryRange } from "@/lib/formatting";
import { WORK_ARRANGEMENT_LABELS } from "@/lib/constants/categories";
import { useRepositories } from "@/lib/repositories/useRepositories";
import { useGuestSession } from "@/lib/context/GuestSessionContext";
import { getRandomRejectReceiptMessage } from "@/features/reject/services/rejectMessages";
import { buildRejectionMetadata } from "@/features/reject/services/rejectionReasons";
import { recordRecruitingDecisionMilestone } from "@/lib/storage/pwaMilestone";
import { notifyMilestoneAction } from "@/features/milestones/notify";
import type { DeckDecision, FictionalCandidate } from "@/types/domain";

export function CandidateProfileClient({ candidate }: { candidate: FictionalCandidate }) {
  const router = useRouter();
  const { repositories, userId } = useRepositories();
  const { anonymousSessionId } = useGuestSession();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  useEffect(() => {
    void repositories.actions.recordAction({
      userId: userId === "guest" ? null : userId,
      anonymousSessionId,
      actionType: "candidate_viewed",
      candidateId: candidate.id,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per candidate
  }, [candidate.id]);

  const decide = async (decision: Exclude<DeckDecision, "reject">) => {
    const actionType =
      decision === "shortlist" ? "candidate_shortlisted" : "candidate_offered";
    try {
      await repositories.actions.recordAction({
        userId: userId === "guest" ? null : userId,
        anonymousSessionId,
        actionType,
        candidateId: candidate.id,
      });
      notifyMilestoneAction(
        decision === "shortlist"
          ? "fictional_candidate_shortlisted"
          : "fictional_offer_sent",
      );
    } catch {
      toast.error("Could not record this fictional decision. Try again.");
      return;
    }

    if (decision === "shortlist") toast.success(`${candidate.displayName} shortlisted.`);
    else toast.success("Simulated offer created. No real person was contacted.");

    recordRecruitingDecisionMilestone();
    router.push("/reject");
  };

  const confirmReject = async (payload: RejectReasonConfirmPayload) => {
    setRejectSubmitting(true);
    setRejectError(null);
    try {
      await repositories.actions.recordAction({
        userId: userId === "guest" ? null : userId,
        anonymousSessionId,
        actionType: "candidate_rejected",
        candidateId: candidate.id,
        metadata: buildRejectionMetadata({
          reasonCode: payload.reasonCode,
          reasonLabel: payload.reasonLabel,
          comment: payload.comment,
          source: payload.source,
          candidateDisplayName: candidate.displayName,
          simulationOnly: true,
        }),
      });
      notifyMilestoneAction("fictional_candidate_rejected");
    } catch {
      setRejectSubmitting(false);
      setRejectError("Could not record this fictional decision. Try again.");
      return;
    }

    setRejectOpen(false);
    setRejectSubmitting(false);
    toast(getRandomRejectReceiptMessage());
    recordRecruitingDecisionMilestone();
    router.push("/reject");
  };

  return (
    <PageContainer className="flex flex-col gap-8 py-10 pb-28 sm:pb-10">
      <Link
        href="/reject"
        className="focus-ring text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 rounded text-sm"
      >
        <ChevronLeft className="h-4 w-4" /> Back to deck
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="border-border bg-surface flex flex-col gap-4 rounded-[var(--radius-lg)] border p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <CandidateAvatar
                  initials={candidate.initials}
                  avatarStyle={candidate.avatarStyle}
                  className="h-16 w-16 text-xl"
                />
                <div>
                  <h1 className="text-foreground text-2xl font-semibold">
                    {candidate.displayName}
                  </h1>
                  <p className="text-muted-foreground text-sm">{candidate.headline}</p>
                </div>
              </div>
              <Badge variant="reject">Fictional candidate</Badge>
            </div>

            <p className="text-muted-foreground text-xs">
              Created for the OfferLoop simulation.
            </p>

            <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {candidate.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" /> {candidate.recentRole}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {candidate.yearsExperience} years
                fictional experience
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-surface-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <Section title="Fictional summary">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {candidate.summary}
            </p>
          </Section>

          <Section title="Fictional work history">
            <div className="flex flex-col gap-4">
              {candidate.workHistory.map((entry) => (
                <div
                  key={`${entry.company}-${entry.role}`}
                  className="flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-foreground font-medium">{entry.role}</p>
                    <p className="text-muted-foreground text-xs">{entry.duration}</p>
                  </div>
                  <p className="text-muted-foreground text-sm">{entry.company}</p>
                  <p className="text-muted-foreground text-sm">{entry.summary}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Fictional projects">
            <div className="flex flex-col gap-4">
              {candidate.projects.map((project) => (
                <div key={project.name} className="flex flex-col gap-1">
                  <p className="text-foreground font-medium">{project.name}</p>
                  <p className="text-muted-foreground text-sm">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-surface-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Fictional achievements">
            <ul className="flex flex-col gap-2">
              {candidate.achievements.map((achievement) => (
                <li
                  key={achievement}
                  className="text-muted-foreground flex items-start gap-2 text-sm"
                >
                  <Check
                    className="text-brand mt-0.5 h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  {achievement}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Fictional education">
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4" /> {candidate.education}
            </p>
          </Section>
        </div>

        <aside className="border-border bg-surface hidden flex-col gap-4 rounded-[var(--radius-lg)] border p-5 lg:sticky lg:top-24 lg:flex">
          <ProfileActions
            candidate={candidate}
            onReject={() => setRejectOpen(true)}
            onDecide={decide}
          />
        </aside>
      </div>

      <div className="border-border bg-surface/95 fixed inset-x-0 bottom-0 z-30 flex flex-col gap-3 border-t p-4 backdrop-blur sm:hidden">
        <ProfileActions
          candidate={candidate}
          onReject={() => setRejectOpen(true)}
          onDecide={decide}
          compact
        />
      </div>

      <RejectReasonDialog
        open={rejectOpen}
        candidate={candidate}
        source="reject_button"
        submitting={rejectSubmitting}
        errorMessage={rejectError}
        onCancel={() => {
          if (!rejectSubmitting) {
            setRejectOpen(false);
            setRejectError(null);
          }
        }}
        onConfirm={(payload) => {
          void confirmReject(payload);
        }}
      />
    </PageContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-border bg-surface flex flex-col gap-3 rounded-[var(--radius-lg)] border p-6">
      <h2 className="text-foreground text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function ProfileActions({
  candidate,
  onReject,
  onDecide,
  compact = false,
}: {
  candidate: FictionalCandidate;
  onReject: () => void;
  onDecide: (decision: Exclude<DeckDecision, "reject">) => void;
  compact?: boolean;
}) {
  return (
    <>
      {!compact ? (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground font-medium">
              {formatSalaryRange(
                candidate.expectedSalaryMin,
                candidate.expectedSalaryMax,
              )}
            </span>
            <span className="text-muted-foreground">
              {WORK_ARRANGEMENT_LABELS[candidate.preferredWorkArrangement]}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Availability: {candidate.availability}
          </p>
        </>
      ) : null}
      <div className={compact ? "flex items-center gap-2" : "flex flex-col gap-2"}>
        <Button
          type="button"
          variant="reject"
          size={compact ? "md" : "lg"}
          className="flex-1"
          onClick={onReject}
        >
          <X className="h-4 w-4" /> {!compact ? "Reject" : ""}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size={compact ? "md" : "lg"}
          className="flex-1"
          onClick={() => onDecide("offer")}
        >
          <Mail className="h-4 w-4" /> {!compact ? "Send offer" : ""}
        </Button>
        <Button
          type="button"
          variant="accept"
          size={compact ? "md" : "lg"}
          className="flex-1"
          onClick={() => onDecide("shortlist")}
        >
          <Check className="h-4 w-4" /> {!compact ? "Shortlist" : ""}
        </Button>
      </div>
    </>
  );
}
