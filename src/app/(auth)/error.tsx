"use client";

import { useEffect } from "react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { Button } from "@/components/ui/button";

export default function AuthSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("OfferLoop auth segment error:", error);
  }, [error]);

  return (
    <AuthCard
      title="Something went wrong"
      description="We hit an unexpected error loading this page."
    >
      <Button type="button" variant="secondary" onClick={reset}>
        Try again
      </Button>
    </AuthCard>
  );
}
