import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <PageContainer className="flex min-h-[70vh] items-center justify-center py-16">
      <EmptyState
        icon={WifiOff}
        title="You're offline"
        description="Your connection appears to be offline. Marketing pages and guest data you've already loaded remain available on this device. Account changes and Supabase sync need a connection."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild variant="primary">
              <Link href="/">Try the homepage</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/offers">View saved offers</Link>
            </Button>
          </div>
        }
      />
    </PageContainer>
  );
}
