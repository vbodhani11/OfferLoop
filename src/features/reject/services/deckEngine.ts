import type { DeckDecision, FictionalCandidate } from "@/types/domain";
import type { RejectionDetails } from "@/features/reject/services/rejectionReasons";

export interface DeckHistoryEntry {
  candidate: FictionalCandidate;
  decision: DeckDecision;
  /** Present when the decision was a confirmed rejection with a reason. */
  rejection?: RejectionDetails;
}

export interface DeckStats {
  rejected: number;
  shortlisted: number;
  offered: number;
}

export interface DeckState {
  queue: FictionalCandidate[];
  history: DeckHistoryEntry[];
  stats: DeckStats;
}

export function createInitialDeckState(candidates: FictionalCandidate[]): DeckState {
  return {
    queue: [...candidates],
    history: [],
    stats: { rejected: 0, shortlisted: 0, offered: 0 },
  };
}

const STAT_KEY: Record<DeckDecision, keyof DeckStats> = {
  reject: "rejected",
  shortlist: "shortlisted",
  offer: "offered",
};

export function applyDecision(
  state: DeckState,
  decision: DeckDecision,
  rejection?: RejectionDetails,
): DeckState {
  const [current, ...rest] = state.queue;
  if (!current) return state;

  const statKey = STAT_KEY[decision];
  return {
    queue: rest,
    history: [
      ...state.history,
      {
        candidate: current,
        decision,
        ...(decision === "reject" && rejection ? { rejection } : {}),
      },
    ],
    stats: { ...state.stats, [statKey]: state.stats[statKey] + 1 },
  };
}

export function undoLastDecision(state: DeckState): DeckState {
  if (state.history.length === 0) return state;
  const lastEntry = state.history[state.history.length - 1];
  const statKey = STAT_KEY[lastEntry.decision];
  return {
    queue: [lastEntry.candidate, ...state.queue],
    history: state.history.slice(0, -1),
    stats: { ...state.stats, [statKey]: Math.max(0, state.stats[statKey] - 1) },
  };
}

/** Horizontal/vertical drag distance (px) required before a swipe commits to a decision. */
export const SWIPE_THRESHOLD = 120;

/**
 * Pure mapping from a drag release offset to the decision it represents, or
 * `null` if the drag did not clear the threshold (card should spring back).
 * Kept independent of any gesture library so it can be unit tested directly
 * instead of simulating pointer events.
 */
export function resolveDragDecision(
  offset: { x: number; y: number },
  threshold: number = SWIPE_THRESHOLD,
): DeckDecision | null {
  const isVerticalDrag = Math.abs(offset.y) > Math.abs(offset.x);
  if (isVerticalDrag && offset.y < -threshold) return "offer";
  if (offset.x < -threshold) return "reject";
  if (offset.x > threshold) return "shortlist";
  return null;
}
