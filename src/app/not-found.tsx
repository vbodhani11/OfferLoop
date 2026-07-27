import Link from "next/link";
import { Compass } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageContainer className="flex min-h-[60vh] items-center justify-center py-16">
      <EmptyState
        icon={Compass}
        title="This page doesn't exist in the simulation"
        description="The fictional page you're looking for may have moved, been renamed, or never existed. Let's get you back on track."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild variant="primary">
              <Link href="/">Back to homepage</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/accept">Browse fictional jobs</Link>
            </Button>
          </div>
        }
      />
    </PageContainer>
  );
}
