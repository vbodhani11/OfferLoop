"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PartyPopper, Search, Share2, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SimulationBadge } from "@/components/branding/SimulationBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { CardGridSkeleton } from "@/components/feedback/LoadingSkeleton";
import { ConfirmationDialog } from "@/components/feedback/ConfirmationDialog";
import { OFFER_SORT_OPTIONS, type OfferSortOption } from "@/lib/constants/categories";
import { formatDate, formatSalaryRange } from "@/lib/formatting";
import { useRepositories } from "@/lib/repositories/useRepositories";
import type { OfferWithJob } from "@/types/domain";

export default function OffersPage() {
  const { repositories, userId } = useRepositories();
  const [offers, setOffers] = useState<OfferWithJob[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<OfferSortOption>("newest");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const result = await repositories.offers.listOffers(userId);
      setOffers(result);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [repositories, userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern; setStatus fires before the first await
    load();
  }, [load]);

  const visibleOffers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    let result = offers;
    if (needle) {
      result = result.filter(
        (offer) =>
          offer.job.title.toLowerCase().includes(needle) ||
          offer.job.organization.name.toLowerCase().includes(needle),
      );
    }
    const copy = [...result];
    switch (sort) {
      case "oldest":
        return copy.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case "salary_high":
        return copy.sort((a, b) => b.salaryMax - a.salaryMax);
      case "salary_low":
        return copy.sort((a, b) => a.salaryMin - b.salaryMin);
      case "company_az":
        return copy.sort((a, b) =>
          a.job.organization.name.localeCompare(b.job.organization.name),
        );
      case "role_az":
        return copy.sort((a, b) => a.job.title.localeCompare(b.job.title));
      case "newest":
      default:
        return copy.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  }, [offers, search, sort]);

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await repositories.offers.deleteOffer(userId, pendingDeleteId);
      setOffers((prev) => prev.filter((offer) => offer.id !== pendingDeleteId));
      toast.success("Offer deleted.");
    } catch {
      toast.error("We could not delete that offer. Try again.");
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <PageContainer className="flex flex-col gap-8 py-10">
      <div className="flex flex-col gap-4">
        <SimulationBadge />
        <SectionHeading
          title="My fictional offers"
          description="Every simulated offer you've received, all in one place."
        />
      </div>

      {status === "ready" && offers.length > 0 ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search by role or company"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              aria-label="Search fictional offers"
            />
          </div>
          <Select
            value={sort}
            onValueChange={(value) => setSort(value as OfferSortOption)}
          >
            <SelectTrigger className="sm:w-56" aria-label="Sort offers">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OFFER_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {status === "loading" ? <CardGridSkeleton count={4} /> : null}
      {status === "error" ? (
        <ErrorState
          description="We could not load your fictional offers. Try again."
          onRetry={load}
        />
      ) : null}

      {status === "ready" && offers.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title="Your first fictional offer is one application away."
          description="Apply to a simulated job in Accept Mode to receive an instant fictional offer."
          action={
            <Button asChild variant="accept">
              <Link href="/accept">Explore Accept Mode</Link>
            </Button>
          }
        />
      ) : null}

      {status === "ready" && offers.length > 0 && visibleOffers.length === 0 ? (
        <EmptyState
          title="No offers match your search"
          description="Try a different search term."
        />
      ) : null}

      {status === "ready" && visibleOffers.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {visibleOffers.map((offer) => (
              <motion.div
                key={offer.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="border-border bg-surface flex flex-col gap-3 rounded-[var(--radius-lg)] border p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-sm font-semibold text-white"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${offer.job.organization.logoStyle.gradientFrom}, ${offer.job.organization.logoStyle.gradientTo})`,
                      }}
                      aria-hidden="true"
                    >
                      {offer.job.organization.initials}
                    </div>
                    <div>
                      <p className="text-foreground font-medium">{offer.job.title}</p>
                      <p className="text-muted-foreground text-sm">
                        {offer.job.organization.name}
                      </p>
                    </div>
                  </div>
                  <Badge variant="brand">Simulated</Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-semibold">
                    {formatSalaryRange(offer.salaryMin, offer.salaryMax, offer.currency)}
                  </span>
                  <span className="text-muted-foreground">
                    {formatDate(offer.createdAt)}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/offers/${offer.id}`}>View</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/offers/${offer.id}?celebrate=1`}>
                      <PartyPopper className="h-4 w-4" /> Replay
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/offers/${offer.id}?share=1`}>
                      <Share2 className="h-4 w-4" /> Share
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-danger hover:text-danger ml-auto"
                    aria-label={`Delete offer for ${offer.job.title}`}
                    onClick={() => setPendingDeleteId(offer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : null}

      <ConfirmationDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="Delete this fictional offer?"
        description="This will permanently remove the offer from your account. This action cannot be undone."
        confirmLabel="Delete offer"
        destructive
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
