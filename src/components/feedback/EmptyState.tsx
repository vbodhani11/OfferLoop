import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border bg-surface-muted/50 flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed px-6 py-14 text-center",
        className,
      )}
    >
      <div className="bg-surface text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-foreground text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
