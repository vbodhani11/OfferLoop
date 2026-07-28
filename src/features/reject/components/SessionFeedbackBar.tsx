"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { Check, Mail, Users, X, type LucideIcon } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

function SessionStat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "reject" | "accept" | "brand" | "muted";
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    if (reducedMotion || previous.current === value) {
      previous.current = value;
      setDisplay(value);
      return;
    }
    const controls = animate(previous.current, value, {
      duration: 0.35,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    previous.current = value;
    return () => controls.stop();
  }, [value, reducedMotion]);

  const toneClass =
    tone === "reject"
      ? "text-reject"
      : tone === "accept"
        ? "text-accept"
        : tone === "brand"
          ? "text-brand"
          : "text-muted-foreground";

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Icon className={cn("h-3.5 w-3.5 shrink-0", toneClass)} aria-hidden="true" />
      <span aria-hidden="true">
        <span className="text-muted-foreground">{label}: </span>
        <span className="text-foreground font-semibold tabular-nums">{display}</span>
      </span>
      <span className="sr-only" aria-live="polite">
        {label}: {value}
      </span>
    </div>
  );
}

/** Compact session counters — deliberately not a dashboard of large cards. */
export function SessionFeedbackBar({
  rejected,
  shortlisted,
  offered,
  remaining,
}: {
  rejected: number;
  shortlisted: number;
  offered: number;
  remaining: number;
}) {
  return (
    <div
      data-testid="session-feedback-bar"
      className="border-border bg-surface/80 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-[var(--radius-md)] border px-3 py-2.5 sm:gap-x-5"
    >
      <SessionStat label="Rejected" value={rejected} icon={X} tone="reject" />
      <SessionStat label="Shortlisted" value={shortlisted} icon={Check} tone="accept" />
      <SessionStat label="Simulated offers" value={offered} icon={Mail} tone="brand" />
      <SessionStat label="Remaining" value={remaining} icon={Users} tone="muted" />
    </div>
  );
}
