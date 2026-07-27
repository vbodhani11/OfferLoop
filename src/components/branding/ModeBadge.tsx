import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModeBadge({
  mode,
  className,
}: {
  mode: "accept" | "reject";
  className?: string;
}) {
  const isAccept = mode === "accept";
  const Icon = isAccept ? CheckCircle2 : XCircle;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        isAccept ? "bg-accept-muted text-accept" : "bg-reject-muted text-reject",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {isAccept ? "Accept Mode" : "Reject Mode"}
    </span>
  );
}
