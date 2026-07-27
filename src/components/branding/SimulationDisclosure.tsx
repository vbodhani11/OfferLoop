import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulationDisclosureProps {
  className?: string;
  compact?: boolean;
  children?: React.ReactNode;
}

export function SimulationDisclosure({
  className,
  compact = false,
  children,
}: SimulationDisclosureProps) {
  return (
    <div
      role="note"
      className={cn(
        "border-border bg-surface-muted text-muted-foreground flex items-start gap-2 rounded-[var(--radius-md)] border",
        compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm",
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>
        {children ?? "Entertainment simulation. No real jobs or candidates are involved."}
      </p>
    </div>
  );
}
