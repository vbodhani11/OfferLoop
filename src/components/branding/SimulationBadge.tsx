import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function SimulationBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "border-brand/30 bg-brand-muted text-brand inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        className,
      )}
    >
      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
      Entertainment simulation
    </span>
  );
}
