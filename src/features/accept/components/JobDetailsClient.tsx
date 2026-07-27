"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  Building2,
  ChevronLeft,
  MapPin,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimulationDisclosure } from "@/components/branding/SimulationDisclosure";
import { JobCard } from "./JobCard";
import { formatSalaryRange, formatRelativeDays } from "@/lib/formatting";
import {
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORK_ARRANGEMENT_LABELS,
} from "@/lib/constants/categories";
import { useRepositories } from "@/lib/repositories/useRepositories";
import { useGuestSession } from "@/lib/context/GuestSessionContext";
import type { JobWithOrganization } from "@/types/domain";

export function JobDetailsClient({
  job,
  similarJobs,
}: {
  job: JobWithOrganization;
  similarJobs: JobWithOrganization[];
}) {
  const { repositories, userId } = useRepositories();
  const { anonymousSessionId } = useGuestSession();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let active = true;
    repositories.savedJobs.isSaved(userId, job.id).then((saved) => {
      if (active) setIsSaved(saved);
    });
    void repositories.actions.recordAction({
      userId: userId === "guest" ? null : userId,
      anonymousSessionId,
      actionType: "job_viewed",
      jobId: job.id,
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per job
  }, [job.id]);

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        await repositories.savedJobs.unsaveJob(userId, job.id);
        setIsSaved(false);
        toast.success("Removed from saved jobs.");
      } else {
        await repositories.savedJobs.saveJob(userId, job.id);
        setIsSaved(true);
        toast.success("Saved to My Saved Jobs.");
      }
    } catch {
      toast.error("We could not update your saved jobs. Try again.");
    }
  };

  return (
    <PageContainer className="flex flex-col gap-8 py-10 pb-28 sm:pb-10">
      <Link
        href="/accept"
        className="focus-ring text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 rounded text-sm"
      >
        <ChevronLeft className="h-4 w-4" /> Back to fictional jobs
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="border-border bg-surface flex flex-col gap-4 rounded-[var(--radius-lg)] border p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-lg font-semibold text-white"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${job.organization.logoStyle.gradientFrom}, ${job.organization.logoStyle.gradientTo})`,
                  }}
                  aria-hidden="true"
                >
                  {job.organization.initials}
                </div>
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {job.organization.name}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Building2 className="h-3 w-3" /> Fictional company —{" "}
                    {job.organization.industry}
                  </p>
                </div>
              </div>
              <Badge variant="brand">{job.matchPercentage}% fictional match</Badge>
            </div>

            <div>
              <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
                {job.title}
              </h1>
              <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {job.location}
                </span>
                <span>{WORK_ARRANGEMENT_LABELS[job.workArrangement]}</span>
                <span>{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</span>
                <span>{EXPERIENCE_LEVEL_LABELS[job.experienceLevel]}</span>
                <span>{formatRelativeDays(job.simulatedPostedDaysAgo)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-surface-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>

            <SimulationDisclosure>
              This job posting exists only inside the OfferLoop simulation. No real
              employer will receive your information.
            </SimulationDisclosure>
          </div>

          <Section title="About this fictional role">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {job.description}
            </p>
          </Section>

          <Section title="Fictional responsibilities">
            <ul className="flex flex-col gap-2">
              {job.responsibilities.map((item) => (
                <ListItem key={item}>{item}</ListItem>
              ))}
            </ul>
          </Section>

          <Section title="Fictional qualifications">
            <ul className="flex flex-col gap-2">
              {job.qualifications.map((item) => (
                <ListItem key={item}>{item}</ListItem>
              ))}
            </ul>
          </Section>

          <Section title="Fictional benefits">
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {job.benefits.map((item) => (
                <ListItem key={item}>{item}</ListItem>
              ))}
            </ul>
          </Section>

          <Section title="Fictional hiring manager">
            <p className="text-muted-foreground text-sm">
              {job.fictionalManagerName} is the imaginary hiring manager for this
              simulated role.
            </p>
          </Section>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="border-border bg-surface hidden flex-col gap-4 rounded-[var(--radius-lg)] border p-5 lg:sticky lg:top-24 lg:flex">
            <ActionPanel job={job} isSaved={isSaved} onSaveToggle={handleSaveToggle} />
          </div>

          {similarJobs.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h2 className="text-foreground text-sm font-semibold">
                Similar fictional jobs
              </h2>
              {similarJobs.map((similar) => (
                <JobCard key={similar.id} job={similar} className="p-4" />
              ))}
            </div>
          ) : null}
        </aside>
      </div>

      <div className="border-border bg-surface/95 fixed inset-x-0 bottom-0 z-30 flex flex-col gap-3 border-t p-4 backdrop-blur sm:hidden">
        <ActionPanel
          job={job}
          isSaved={isSaved}
          onSaveToggle={handleSaveToggle}
          compact
        />
      </div>
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

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="text-muted-foreground flex items-start gap-2 text-sm">
      <Sparkles className="text-brand mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {children}
    </li>
  );
}

function ActionPanel({
  job,
  isSaved,
  onSaveToggle,
  compact = false,
}: {
  job: JobWithOrganization;
  isSaved: boolean;
  onSaveToggle: () => void;
  compact?: boolean;
}) {
  return (
    <>
      {!compact ? (
        <span className="text-foreground text-lg font-semibold">
          {formatSalaryRange(job.salaryMin, job.salaryMax, job.currency)}
        </span>
      ) : null}
      <div className={compact ? "flex items-center gap-2" : "flex flex-col gap-2"}>
        <Button
          asChild
          size="lg"
          variant="accept"
          className={compact ? "flex-1" : undefined}
        >
          <Link href={`/accept/review/${job.id}`}>Apply to this fictional role</Link>
        </Button>
        <Button
          type="button"
          variant="secondary"
          size={compact ? "lg" : "md"}
          onClick={onSaveToggle}
          aria-pressed={isSaved}
        >
          {isSaved ? (
            <BookmarkCheck className="text-brand h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          {!compact ? (isSaved ? "Saved" : "Save job") : null}
        </Button>
      </div>
      {!compact ? (
        <p className="text-muted-foreground text-xs">
          This opportunity exists only inside the OfferLoop simulation.
        </p>
      ) : null}
    </>
  );
}
