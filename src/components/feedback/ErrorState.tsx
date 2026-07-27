import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We could not complete that action. Please try again.",
  onRetry,
  retryLabel = "Retry",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "border-danger/30 bg-danger/5 flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border px-6 py-14 text-center",
        className,
      )}
    >
      <div className="bg-surface text-danger flex h-12 w-12 items-center justify-center rounded-full">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-foreground text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
      {onRetry ? (
        <Button type="button" variant="secondary" onClick={onRetry} className="mt-2">
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
