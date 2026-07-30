"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, Bookmark, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SimulationDisclosure } from "@/components/branding/SimulationDisclosure";
import { ModeBadge } from "@/components/branding/ModeBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { CardGridSkeleton } from "@/components/feedback/LoadingSkeleton";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { JobCard } from "@/features/accept/components/JobCard";
import {
  JobFilterControls,
  type JobFilterValues,
} from "@/features/accept/components/JobFilterControls";
import { useRepositories } from "@/lib/repositories/useRepositories";
import { useGuestSession } from "@/lib/context/GuestSessionContext";
import { useDebouncedValue } from "@/lib/motion/useDebouncedValue";
import { notifyMilestoneAction } from "@/features/milestones/notify";
import type { JobWithOrganization } from "@/types/domain";
import Link from "next/link";

const DEFAULT_FILTERS: JobFilterValues = {
  category: "",
  experienceLevel: "",
  workArrangement: "",
  employmentType: "",
  sort: "best_match",
};

export default function AcceptModePage() {
  return (
    <Suspense fallback={<AcceptModeFallback />}>
      <AcceptModePageContent />
    </Suspense>
  );
}

function AcceptModeFallback() {
  return (
    <PageContainer className="flex flex-col gap-8 py-10">
      <CardGridSkeleton count={6} />
    </PageContainer>
  );
}

function AcceptModePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { repositories, userId } = useRepositories();
  const { anonymousSessionId } = useGuestSession();

  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const filters: JobFilterValues = useMemo(
    () => ({
      category: searchParams.get("category") ?? "",
      experienceLevel: searchParams.get("experience") ?? "",
      workArrangement: searchParams.get("arrangement") ?? "",
      employmentType: searchParams.get("employment") ?? "",
      sort: searchParams.get("sort") ?? DEFAULT_FILTERS.sort,
    }),
    [searchParams],
  );

  const [jobs, setJobs] = useState<JobWithOrganization[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [skippedJobIds, setSkippedJobIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const updateUrl = useCallback(
    (patch: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      router.replace(`/accept?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  useEffect(() => {
    updateUrl({ q: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only fire on debounced value change
  }, [debouncedSearch]);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const [jobResults, saved] = await Promise.all([
        repositories.jobs.listJobs({
          search: debouncedSearch,
          category: filters.category || undefined,
          experienceLevel: filters.experienceLevel || undefined,
          workArrangement: filters.workArrangement || undefined,
          employmentType: filters.employmentType || undefined,
          sort: filters.sort,
        }),
        repositories.savedJobs.listSavedJobs(userId),
      ]);
      setJobs(jobResults);
      setSavedJobIds(new Set(saved.map((job) => job.id)));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [repositories, userId, debouncedSearch, filters]);

  useEffect(() => {
    // `load` synchronously sets a "loading" status before its first await,
    // which is the standard fetch-on-dependency-change pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const visibleJobs = jobs.filter((job) => !skippedJobIds.has(job.id));

  const handleSave = async (job: JobWithOrganization) => {
    const isSaved = savedJobIds.has(job.id);
    try {
      if (isSaved) {
        await repositories.savedJobs.unsaveJob(userId, job.id);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(job.id);
          return next;
        });
        toast.success("Removed from saved jobs.");
      } else {
        await repositories.savedJobs.saveJob(userId, job.id);
        setSavedJobIds((prev) => new Set(prev).add(job.id));
        await repositories.actions.recordAction({
          userId: userId === "guest" ? null : userId,
          anonymousSessionId,
          actionType: "job_saved",
          jobId: job.id,
        });
        notifyMilestoneAction("fictional_job_saved");
        toast.success("Saved to My Saved Jobs.");
      }
    } catch {
      toast.error("We could not update your saved jobs. Try again.");
    }
  };

  const handleSkip = (job: JobWithOrganization) => {
    setSkippedJobIds((prev) => new Set(prev).add(job.id));
    void repositories.actions.recordAction({
      userId: userId === "guest" ? null : userId,
      anonymousSessionId,
      actionType: "job_skipped",
      jobId: job.id,
    });
    toast("Job skipped for this session.", {
      action: {
        label: "Undo",
        onClick: () =>
          setSkippedJobIds((prev) => {
            const next = new Set(prev);
            next.delete(job.id);
            return next;
          }),
      },
    });
  };

  const handleClearAll = () => {
    setSearchInput("");
    router.replace("/accept", { scroll: false });
  };

  const handleFilterChange = (patch: Partial<JobFilterValues>) => {
    const mapped: Record<string, string> = {};
    if ("category" in patch) mapped.category = patch.category ?? "";
    if ("experienceLevel" in patch) mapped.experience = patch.experienceLevel ?? "";
    if ("workArrangement" in patch) mapped.arrangement = patch.workArrangement ?? "";
    if ("employmentType" in patch) mapped.employment = patch.employmentType ?? "";
    if ("sort" in patch) mapped.sort = patch.sort ?? "";
    updateUrl(mapped);
  };

  return (
    <PageContainer className="flex flex-col gap-8 py-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <ModeBadge mode="accept" />
        </div>
        <SectionHeading
          title="Browse fictional jobs"
          description="Search a simulated catalog of imaginary roles at fictional companies. Every application in this mode ends in a simulated offer."
        />
        <SimulationDisclosure compact>
          Every job below is fictional. Applying does not send any information to a real
          employer.
        </SimulationDisclosure>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search title, company, or skill"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="pl-9"
            aria-label="Search fictional jobs"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm" role="status">
            {status === "ready" ? `${visibleJobs.length} fictional jobs` : ""}
          </span>
          <Button asChild variant="secondary" size="sm">
            <Link href="/saved">
              <Bookmark className="h-4 w-4" /> Saved ({savedJobIds.size})
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="secondary" size="sm" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
              <SheetTitle className="mb-4">Filter fictional jobs</SheetTitle>
              <JobFilterControls
                values={filters}
                onChange={handleFilterChange}
                onClearAll={handleClearAll}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="border-border bg-surface sticky top-24 rounded-[var(--radius-lg)] border p-5">
            <JobFilterControls
              values={filters}
              onChange={handleFilterChange}
              onClearAll={handleClearAll}
            />
          </div>
        </aside>

        <div>
          {status === "loading" ? <CardGridSkeleton count={6} /> : null}
          {status === "error" ? (
            <ErrorState
              description="We could not load fictional jobs. Try again."
              onRetry={load}
            />
          ) : null}
          {status === "ready" && visibleJobs.length === 0 ? (
            <EmptyState
              icon={RotateCcw}
              title="No fictional jobs match those filters"
              description="Try a different search or clear your filters to see the full simulated catalog."
              action={
                <Button type="button" variant="secondary" onClick={handleClearAll}>
                  Clear all filters
                </Button>
              }
            />
          ) : null}
          {status === "ready" && visibleJobs.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AnimatePresence initial={false}>
                {visibleJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                  >
                    <JobCard
                      job={job}
                      isSaved={savedJobIds.has(job.id)}
                      onSave={handleSave}
                      onSkip={handleSkip}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
