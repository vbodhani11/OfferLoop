"use client";

import { useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ErrorState } from "@/components/feedback/ErrorState";

export default function AppSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("OfferLoop app segment error:", error);
  }, [error]);

  return (
    <PageContainer className="flex min-h-[60vh] items-center justify-center py-16">
      <ErrorState
        title="Something went wrong"
        description="We hit an unexpected technical error loading this part of the simulation. Your guest data on this device is unaffected."
        onRetry={reset}
      />
    </PageContainer>
  );
}
