import { cn } from "@/lib/utils";

export function GlassCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-surface/70 rounded-[var(--radius-xl)] border border-white/20 shadow-[var(--shadow-soft-lg)] backdrop-blur-xl dark:border-white/10",
        className,
      )}
      {...props}
    />
  );
}
