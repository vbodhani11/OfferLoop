import { PageContainer } from "@/components/layout/PageContainer";
import { CardGridSkeleton } from "@/components/feedback/LoadingSkeleton";

export default function AppSegmentLoading() {
  return (
    <PageContainer className="flex flex-col gap-8 py-10">
      <div
        className="bg-surface-muted h-8 w-56 animate-pulse rounded-[var(--radius-sm)]"
        aria-hidden="true"
      />
      <CardGridSkeleton count={4} />
    </PageContainer>
  );
}
