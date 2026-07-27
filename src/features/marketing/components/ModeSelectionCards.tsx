"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, FileText, RotateCcw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

function ModeCard({
  mode,
  href,
  title,
  description,
  cta,
}: {
  mode: "accept" | "reject";
  href: string;
  title: string;
  description: string;
  cta: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reducedMotion = usePrefersReducedMotion();
  const isAccept = mode === "accept";
  const shouldPreview = inView && !reducedMotion;

  return (
    <motion.div
      ref={ref}
      whileHover={reducedMotion ? undefined : { y: -4 }}
      className={cn(
        "group relative flex flex-col gap-6 overflow-hidden rounded-[var(--radius-xl)] border p-8 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-soft-lg)]",
        isAccept
          ? "border-accept/30 bg-accept-muted/40"
          : "border-reject/30 bg-reject-muted/40",
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full",
          isAccept
            ? "bg-accept text-accept-foreground"
            : "bg-reject text-reject-foreground",
        )}
      >
        {isAccept ? (
          <CheckCircle2 className="h-6 w-6" />
        ) : (
          <RotateCcw className="h-6 w-6" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-foreground text-2xl font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>

      <div className="relative flex h-16 items-center gap-2" aria-hidden="true">
        {isAccept ? (
          <motion.div
            className="border-border bg-surface flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-xs font-medium shadow-[var(--shadow-soft)] group-hover:shadow-[var(--shadow-soft-lg)]"
            animate={shouldPreview ? { y: [0, -4, 0] } : undefined}
            transition={{ duration: 1.2, repeat: 0 }}
          >
            <FileText className="text-accept h-4 w-4" />
            Fictional offer document
          </motion.div>
        ) : (
          <div className="relative h-10 w-24">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="border-border bg-surface absolute h-10 w-16 rounded-[var(--radius-sm)] border shadow-[var(--shadow-soft)]"
                style={{ left: i * 8, zIndex: 3 - i }}
                animate={
                  shouldPreview && i === 0 ? { x: [0, -40], opacity: [1, 0] } : undefined
                }
                transition={{ duration: 1.2 }}
              />
            ))}
            <Users className="text-reject absolute top-1 -right-8 h-6 w-6" />
          </div>
        )}
      </div>

      <Button
        asChild
        variant={isAccept ? "accept" : "reject"}
        size="lg"
        className="mt-auto w-fit"
      >
        <Link href={href}>{cta}</Link>
      </Button>
    </motion.div>
  );
}

export function ModeSelectionCards() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <ModeCard
        mode="accept"
        href="/accept"
        title="Accept Mode"
        description="Browse fictional jobs, submit a fictional application, and receive a fictional offer."
        cta="Enter Accept Mode"
      />
      <ModeCard
        mode="reject"
        href="/reject"
        title="Reject Mode"
        description="Play a fictional recruiter and make fictional hiring decisions on invented candidate profiles."
        cta="Enter Reject Mode"
      />
    </div>
  );
}
