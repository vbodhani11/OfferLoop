"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Bookmark, Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SimulationBadge } from "@/components/branding/SimulationBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { CardGridSkeleton } from "@/components/feedback/LoadingSkeleton";
import { ConfirmationDialog } from "@/components/feedback/ConfirmationDialog";
import { JobCard } from "@/features/accept/components/JobCard";
import { useRepositories } from "@/lib/repositories/useRepositories";
import type { JobWithOrganization } from "@/types/domain";

export default function SavedJobsPage() {
  const { repositories, userId } = useRepositories();
  const [jobs, setJobs] = useState<JobWithOrganization[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [search, setSearch] = useState("");
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const result = await repositories.savedJobs.listSavedJobs(userId);
      setJobs(result);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [repositories, userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern; setStatus fires before the first await
    load();
  }, [load]);

  const visibleJobs = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return jobs;
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(needle) ||
        job.organization.name.toLowerCase().includes(needle) ||
        job.skills.some((skill) => skill.toLowerCase().includes(needle)),
    );
  }, [jobs, search]);

  const handleRemove = async (job: JobWithOrganization) => {
    try {
      await repositories.savedJobs.unsaveJob(userId, job.id);
      setJobs((prev) => prev.filter((item) => item.id !== job.id));
      toast("Removed from saved jobs.");
    } catch {
      toast.error("We could not remove that job. Try again.");
    }
  };

  const handleClearAll = async () => {
    try {
      await repositories.savedJobs.clearAll(userId);
      setJobs([]);
      toast.success("Saved jobs cleared.");
    } catch {
      toast.error("We could not clear your saved jobs. Try again.");
    } finally {
      setClearAllOpen(false);
    }
  };

  return (
    <PageContainer className="flex flex-col gap-8 py-10">
      <div className="flex flex-col gap-4">
        <SimulationBadge />
        <SectionHeading
          title="Saved fictional jobs"
          description="Jobs you've bookmarked to revisit and apply to later."
        />
      </div>

      {status === "ready" && jobs.length > 0 ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search saved jobs"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              aria-label="Search saved jobs"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            className="text-danger hover:text-danger"
            onClick={() => setClearAllOpen(true)}
          >
            Clear all
          </Button>
        </div>
      ) : null}

      {status === "loading" ? <CardGridSkeleton count={4} /> : null}
      {status === "error" ? (
        <ErrorState
          description="We could not load your saved jobs. Try again."
          onRetry={load}
        />
      ) : null}

      {status === "ready" && jobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Save fictional jobs you're interested in to find them here later."
          action={
            <Button asChild variant="secondary">
              <Link href="/accept">Browse fictional jobs</Link>
            </Button>
          }
        />
      ) : null}

      {status === "ready" && jobs.length > 0 && visibleJobs.length === 0 ? (
        <EmptyState
          title="No saved jobs match your search"
          description="Try a different search term."
        />
      ) : null}

      {status === "ready" && visibleJobs.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence initial={false}>
            {visibleJobs.map((job) => (
              <JobCard key={job.id} job={job} isSaved onSave={handleRemove} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : null}

      <ConfirmationDialog
        open={clearAllOpen}
        onOpenChange={setClearAllOpen}
        title="Clear all saved jobs?"
        description="This will remove every job you've saved. This action cannot be undone."
        confirmLabel="Clear all"
        destructive
        onConfirm={handleClearAll}
      />
    </PageContainer>
  );
}
