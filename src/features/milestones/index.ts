export {
  MilestoneProvider,
  useMilestones,
  useAchievementProgress,
} from "./MilestoneProvider";
export { notifyMilestoneAction, notifyMilestoneUndo } from "./notify";
export {
  evaluateMilestones,
  simulationTypeToMilestoneKind,
  mapActionKindToCategory,
  isSupportedMilestoneAction,
  mergeGuestAchievements,
} from "./calculate";
export { ACHIEVEMENT_CATALOG, getAchievementByCode } from "./catalog";
export { ProgressSummaryCard } from "./components/ProgressSummaryCard";
export type {
  MilestoneActionKind,
  MilestoneCategory,
  AchievementCode,
  MilestoneSettings,
} from "./types";
