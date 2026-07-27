"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck, Building2, MapPin, X } from "lucide-react";
import type { JobWithOrganization } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeDays, formatSalaryRange } from "@/lib/formatting";
import {
  EXPERIENCE_LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  WORK_ARRANGEMENT_LABELS,
} from "@/lib/constants/categories";
import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: JobWithOrganization;
  isSaved?: boolean;
  onSave?: (job: JobWithOrganization) => void;
  onSkip?: (job: JobWithOrganization) => void;
  className?: string;
}

export function JobCard({
  job,
  isSaved = false,
  onSave,
  onSkip,
  className,
}: JobCardProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
      whileHover={reducedMotion ? undefined : { y: -4 }}
      className={cn(
        "border-border bg-surface hover:border-brand/40 flex flex-col gap-4 rounded-[var(--radius-lg)] border p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-soft-lg)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-sm font-semibold text-white"
            style={{
              backgroundImage: `linear-gradient(135deg, ${job.organization.logoStyle.gradientFrom}, ${job.organization.logoStyle.gradientTo})`,
            }}
            aria-hidden="true"
          >
            {job.organization.initials}
          </div>
          <div>
            <p className="text-foreground text-sm font-medium">{job.organization.name}</p>
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <Building2 className="h-3 w-3" /> Fictional company
            </p>
          </div>
        </div>
        <Badge variant="brand">{job.matchPercentage}% fictional match</Badge>
      </div>

      <div>
        <h3 className="text-foreground text-lg font-semibold">
          <Link
            href={`/accept/jobs/${job.slug}`}
            className="focus-ring hover:text-brand rounded"
          >
            {job.title}
          </Link>
        </h3>
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {job.location}
          </span>
          <span>{WORK_ARRANGEMENT_LABELS[job.workArrangement]}</span>
          <span>{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</span>
          <span>{EXPERIENCE_LEVEL_LABELS[job.experienceLevel]}</span>
        </div>
      </div>

      <p className="text-muted-foreground line-clamp-2 text-sm">{job.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map((skill) => (
          <motion.span
            key={skill}
            whileHover={reducedMotion ? undefined : { scale: 1.04 }}
            className="bg-surface-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs"
          >
            {skill}
          </motion.span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-foreground text-sm font-semibold">
            {formatSalaryRange(job.salaryMin, job.salaryMax, job.currency)}
          </span>
          <span className="text-muted-foreground text-xs">
            {formatRelativeDays(job.simulatedPostedDaysAgo)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onSkip ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Skip this fictional job"
              onClick={() => onSkip(job)}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
          {onSave ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-pressed={isSaved}
              aria-label={isSaved ? "Remove from saved jobs" : "Save this fictional job"}
              onClick={() => onSave(job)}
            >
              {isSaved ? (
                <BookmarkCheck className="text-brand h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          ) : null}
          <Button asChild size="sm" variant="secondary">
            <Link href={`/accept/jobs/${job.slug}`}>View details</Link>
          </Button>
          <Button asChild size="sm" variant="accept">
            <Link href={`/accept/review/${job.id}`}>Apply</Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
