"use client";

import Link from "next/link";
import { Briefcase, GraduationCap, MapPin } from "lucide-react";
import type { FictionalCandidate } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { CandidateAvatar } from "./CandidateAvatar";
import { formatSalaryRange } from "@/lib/formatting";
import { WORK_ARRANGEMENT_LABELS } from "@/lib/constants/categories";

export function CandidateCard({
  candidate,
  compact = false,
}: {
  candidate: FictionalCandidate;
  compact?: boolean;
}) {
  return (
    <div className="border-border bg-surface flex flex-col gap-4 rounded-[var(--radius-lg)] border p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CandidateAvatar
            initials={candidate.initials}
            avatarStyle={candidate.avatarStyle}
            className="h-14 w-14"
          />
          <div>
            <h3 className="text-foreground text-lg font-semibold">
              <Link
                href={`/reject/candidates/${candidate.slug}`}
                className="focus-ring hover:text-brand rounded"
              >
                {candidate.displayName}
              </Link>
            </h3>
            <p className="text-muted-foreground text-sm">{candidate.headline}</p>
          </div>
        </div>
        <Badge variant="reject">Fictional candidate</Badge>
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {candidate.location}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5" /> {candidate.recentRole}
        </span>
        {!compact ? (
          <span className="flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5" /> {candidate.education}
          </span>
        ) : null}
      </div>

      {!compact ? (
        <p className="text-muted-foreground text-sm">{candidate.summary}</p>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        {candidate.skills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="bg-surface-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-medium">
          {formatSalaryRange(candidate.expectedSalaryMin, candidate.expectedSalaryMax)}
        </span>
        <span className="text-muted-foreground">
          {WORK_ARRANGEMENT_LABELS[candidate.preferredWorkArrangement]}
        </span>
      </div>
    </div>
  );
}
