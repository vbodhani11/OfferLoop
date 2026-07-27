"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmationDialog } from "@/components/feedback/ConfirmationDialog";
import { OfferCelebration } from "@/features/accept/components/OfferCelebration";
import { useRepositories } from "@/lib/repositories/useRepositories";
import type { OfferWithJob } from "@/types/domain";

export default function OfferDetailPage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="flex min-h-[60vh] items-center justify-center py-10">
          <p className="text-muted-foreground text-sm">Loading your fictional offer…</p>
        </PageContainer>
      }
    >
      <OfferDetailPageContent />
    </Suspense>
  );
}

function OfferDetailPageContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { repositories, userId } = useRepositories();

  const [offer, setOffer] = useState<OfferWithJob | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "not-found" | "error">(
    "loading",
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const result = await repositories.offers.getOfferById(userId, params.id);
      if (!result) {
        setStatus("not-found");
        return;
      }
      setOffer(result);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [repositories, userId, params.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern; setStatus fires before the first await
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!offer) return;
    try {
      await repositories.offers.deleteOffer(userId, offer.id);
      toast.success("Offer deleted.");
      router.push("/offers");
    } catch {
      toast.error("We could not delete that offer. Try again.");
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  if (status === "loading") {
    return (
      <PageContainer className="flex min-h-[60vh] items-center justify-center py-10">
        <p className="text-muted-foreground text-sm">Loading your fictional offer…</p>
      </PageContainer>
    );
  }

  if (status === "not-found") {
    return (
      <PageContainer className="py-10">
        <ErrorState
          title="We could not find that fictional offer"
          description="It may have been deleted, or the link may be incorrect."
        />
      </PageContainer>
    );
  }

  if (status === "error" || !offer) {
    return (
      <PageContainer className="py-10">
        <ErrorState
          description="We could not load this fictional offer. Try again."
          onRetry={load}
        />
      </PageContainer>
    );
  }

  return (
    <>
      <OfferCelebration
        offer={offer}
        job={offer.job}
        autoPlayIntro={searchParams.get("celebrate") === "1"}
        initialShareOpen={searchParams.get("share") === "1"}
        onDelete={() => setConfirmDeleteOpen(true)}
      />
      <ConfirmationDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete this fictional offer?"
        description="This will permanently remove the offer from your account. This action cannot be undone."
        confirmLabel="Delete offer"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}
