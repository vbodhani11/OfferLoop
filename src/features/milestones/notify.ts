import type { MilestoneActionKind } from "./types";

type ProgressListener = (kind: MilestoneActionKind) => void;
type UndoListener = (kind: MilestoneActionKind) => void;

const progressListeners = new Set<ProgressListener>();
const undoListeners = new Set<UndoListener>();

/**
 * Subscribe to successful milestone-eligible actions.
 * Returns an unsubscribe function.
 */
export function onMilestoneProgress(listener: ProgressListener): () => void {
  progressListeners.add(listener);
  return () => {
    progressListeners.delete(listener);
  };
}

export function onMilestoneUndo(listener: UndoListener): () => void {
  undoListeners.add(listener);
  return () => {
    undoListeners.delete(listener);
  };
}

/**
 * Call only after the underlying action has been successfully persisted.
 * Never throws — milestone failures must not break core flows.
 */
export function notifyMilestoneAction(kind: MilestoneActionKind): void {
  try {
    for (const listener of progressListeners) {
      listener(kind);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[milestones] notifyMilestoneAction failed", error);
    }
  }
}

/**
 * Call after a successful undo of a previously counted action.
 * Decrements session/lifetime counters; does not revoke achievements.
 */
export function notifyMilestoneUndo(kind: MilestoneActionKind): void {
  try {
    for (const listener of undoListeners) {
      listener(kind);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[milestones] notifyMilestoneUndo failed", error);
    }
  }
}
