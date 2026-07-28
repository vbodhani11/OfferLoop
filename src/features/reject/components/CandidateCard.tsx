"use client";

import Link from "next/link";
import { Briefcase, Calendar, Clock, GraduationCap, MapPin, Sparkles } from "lucide-react";
import type { FictionalCandidate } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { CandidateAvatar } from "./CandidateAvatar";
import { formatSalaryRange } from "@/lib/formatting";
import { WORK_ARRANGEMENT_LABELS } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";

/**
 * Deterministic, purely cosmetic "simulated fit" score derived from the
 * candidate id. Not stored data — just a bit of fictional flavor for the
 * card's bottom section, stable across renders for the same candidate.
 */
function simulatedFitScore(candidateId: string): number {
  let hash = 0;
  for (let index = 0; index < candidateId.length; index += 1) {
    hash = (hash * 31 + candidateId.charCodeAt(index)) >>> 0;
  }
  return 72 + (hash % 24); // 72–95
}

export function CandidateCard({
  candidate,
  compact = false,
  className,
}: {
  candidate: FictionalCandidate;
  compact?: boolean;
  className?: string;
}) {
  return (
    <article
      data-testid="candidate-card"
      className={cn(
        "border-border bg-surface flex w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {/* Top: identity */}
      <div className="flex flex-col gap-2.5 px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <CandidateAvatar
              initials={candidate.initials}
              avatarStyle={candidate.avatarStyle}
              className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
            />
            <div className="min-w-0">
              <h3 className="text-foreground truncate text-base font-semibold sm:text-lg">
                <Link
                  href={`/reject/candidates/${candidate.slug}`}
                  className="focus-ring hover:text-brand rounded"
                >
                  {candidate.displayName}
                </Link>
              </h3>
              <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                {candidate.headline}
              </p>
            </div>
          </div>
          <Badge variant="reject" className="shrink-0">
            Fictional candidate
          </Badge>
        </div>
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {candidate.yearsExperience} years fictional experience
        </p>
      </div>

      {!compact ? (
        <>
          <div className="border-border border-t" />

          {/* Middle: background */}
          <div className="flex flex-col gap-2.5 px-5 py-4">
            <div className="text-muted-foreground flex flex-col gap-1.5 text-sm">
              <span className="flex items-center gap-1.5 truncate">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {candidate.location}
              </span>
              <span className="flex items-center gap-1.5 truncate">
                <Briefcase className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{candidate.recentRole}</span>
              </span>
              <span className="flex items-center gap-1.5 truncate">
                <GraduationCap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{candidate.education}</span>
              </span>
            </div>

            <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
              {candidate.summary}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="bg-surface-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="border-border border-t" />

          {/* Bottom: logistics */}
          <div className="bg-surface-muted/50 flex flex-col gap-1.5 px-5 py-3.5">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-foreground font-semibold">
                {formatSalaryRange(candidate.expectedSalaryMin, candidate.expectedSalaryMax)}
              </span>
              <span className="text-muted-foreground truncate text-right">
                {WORK_ARRANGEMENT_LABELS[candidate.preferredWorkArrangement]}
              </span>
            </div>
            <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
              <span className="flex min-w-0 items-center gap-1.5 truncate">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{candidate.availability}</span>
              </span>
              <span className="text-brand flex shrink-0 items-center gap-1 font-medium">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {simulatedFitScore(candidate.id)}% simulated fit
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 pb-4 text-sm">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {candidate.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {candidate.recentRole}
          </span>
        </div>
      )}
    </article>
  );
}
