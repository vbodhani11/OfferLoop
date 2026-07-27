import type { DeckDecision, FictionalCandidate } from "@/types/domain";

export interface DeckHistoryEntry {
  candidate: FictionalCandidate;
  decision: DeckDecision;
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

export function applyDecision(state: DeckState, decision: DeckDecision): DeckState {
  const [current, ...rest] = state.queue;
  if (!current) return state;

  const statKey = STAT_KEY[decision];
  return {
    queue: rest,
    history: [...state.history, { candidate: current, decision }],
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
