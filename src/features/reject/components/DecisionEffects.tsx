"use client";

import { motion, type MotionValue } from "framer-motion";
import { Check, Mail, MailCheck } from "lucide-react";
import type { DeckDecision } from "@/types/domain";
import { cn } from "@/lib/utils";

const LIVE_STAMP_LABEL: Record<DeckDecision, string> = {
  reject: "REJECT",
  shortlist: "SHORTLIST",
  offer: "OFFER",
};

const CONFIRMED_STAMP_LABEL: Record<DeckDecision, string> = {
  reject: "REJECTED",
  shortlist: "SHORTLIST",
  offer: "OFFER SENT",
};

const STAMP_COLOR: Record<DeckDecision, string> = {
  reject: "border-reject text-reject bg-surface/90",
  shortlist: "border-accept text-accept bg-surface/90",
  offer: "border-brand text-brand bg-surface/90",
};

const STAMP_ROTATION: Record<DeckDecision, number> = {
  reject: -14,
  shortlist: 12,
  offer: 0,
};

const STAMP_POSITION: Record<DeckDecision, string> = {
  reject: "left-6 top-8",
  shortlist: "right-6 top-8",
  offer: "left-1/2 top-8 -translate-x-1/2",
};

/** Stamp that fades in live as the user drags, before any decision commits. */
export function LiveDragStamp({
  decision,
  opacity,
}: {
  decision: DeckDecision;
  opacity: MotionValue<number>;
}) {
  return (
    <motion.div
      style={{ opacity, rotate: STAMP_ROTATION[decision] }}
      className={cn(
        "pointer-events-none absolute rounded-md border-4 px-3 py-1 text-xl font-black tracking-widest uppercase select-none",
        STAMP_COLOR[decision],
        STAMP_POSITION[decision],
      )}
      aria-hidden="true"
    >
      {LIVE_STAMP_LABEL[decision]}
    </motion.div>
  );
}

/** Stamp shown once a decision has actually committed (click or drag past threshold). */
export function ConfirmedStamp({
  decision,
  reducedMotion,
}: {
  decision: DeckDecision;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.5 }}
      animate={{ opacity: 1, scale: reducedMotion ? 1 : [0.5, 1.12, 1] }}
      transition={{ duration: reducedMotion ? 0.1 : 0.28, ease: "easeOut" }}
      style={{ rotate: reducedMotion ? 0 : STAMP_ROTATION[decision] }}
      className={cn(
        "pointer-events-none absolute rounded-md border-4 px-3 py-1 text-xl font-black tracking-widest uppercase select-none",
        STAMP_COLOR[decision],
        STAMP_POSITION[decision],
      )}
      aria-hidden="true"
    >
      {CONFIRMED_STAMP_LABEL[decision]}
    </motion.div>
  );
}

const PARTICLE_OFFSETS = [
  { x: -60, y: -20, r: -35 },
  { x: -84, y: 26, r: 20 },
  { x: -42, y: 58, r: -60 },
  { x: -104, y: -38, r: 50 },
  { x: -30, y: -58, r: -15 },
  { x: -72, y: 8, r: 70 },
];

/** Small, restrained "paper shred" burst used on reject — limited to 6 pieces. */
export function RejectParticles() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-visible"
      aria-hidden="true"
    >
      {PARTICLE_OFFSETS.map((piece, index) => (
        <motion.span
          key={index}
          className="bg-reject/70 absolute top-1/2 left-1/2 h-2 w-4 rounded-[2px]"
          initial={{ opacity: 0.9, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: 0, x: piece.x, y: piece.y, rotate: piece.r }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/** A checkmark that traces into view for a shortlist decision. */
export function ShortlistTrace() {
  return (
    <motion.div
      className="bg-accept pointer-events-none absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-[var(--shadow-soft-lg)]"
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: [0.4, 1.15, 1] }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      aria-hidden="true"
    >
      <Check className="h-7 w-7" />
    </motion.div>
  );
}

/** Envelope that "seals" with a checkmark for an offer decision. */
export function OfferSeal({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      className="bg-brand pointer-events-none absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-[var(--shadow-soft-lg)]"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18 }}
      aria-hidden="true"
    >
      <motion.span
        initial={{ opacity: 1 }}
        animate={{ opacity: reducedMotion ? 0 : [1, 1, 0] }}
        transition={{ duration: 0.4, times: [0, 0.55, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Mail className="h-7 w-7" />
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: reducedMotion ? 1 : [0, 0, 1] }}
        transition={{ duration: 0.4, times: [0, 0.55, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <MailCheck className="h-7 w-7" />
      </motion.span>
    </motion.div>
  );
}
