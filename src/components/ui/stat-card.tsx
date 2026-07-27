"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";

interface StatCardProps {
  label: string;
  value: number;
  icon?: LucideIcon;
  suffix?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  suffix = "",
  className,
}: StatCardProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [animatedValue, setAnimatedValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    if (reducedMotion) {
      previousValue.current = value;
      return;
    }
    const controls = animate(previousValue.current, value, {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (latest) => setAnimatedValue(Math.round(latest)),
    });
    previousValue.current = value;
    return () => controls.stop();
  }, [value, reducedMotion]);

  const displayValue = reducedMotion ? value : animatedValue;

  return (
    <div
      className={cn(
        "border-border bg-surface flex items-center gap-3 rounded-[var(--radius-lg)] border p-4",
        className,
      )}
    >
      {Icon ? (
        <div className="bg-surface-muted text-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      ) : null}
      <div className="flex flex-col">
        <span
          className="text-foreground text-2xl font-semibold tabular-nums"
          aria-hidden="true"
        >
          {displayValue}
          {suffix}
        </span>
        <span className="sr-only" aria-live="polite">
          {label}: {value}
          {suffix}
        </span>
        <span className="text-muted-foreground text-xs">{label}</span>
      </div>
    </div>
  );
}
