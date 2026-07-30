import type { MilestoneCategory } from "./types";

const APPLICATION_LINES = [
  "Five fictional applications launched.",
  "Zero cover letters were harmed.",
  "Your imaginary inbox is feeling optimistic.",
  "Your résumé is now virtually exhausted.",
  "Ten chances created. Zero real rejection emails pending.",
  "Your fictional career is moving suspiciously fast.",
  "Applications sent directly into the imaginary universe.",
  "Career optimism increased by an entirely fictional amount.",
] as const;

const REJECTION_LINES = [
  "No real careers were affected.",
  "The imaginary hiring committee has spoken.",
  "Candidates returned safely to the fictional talent pool.",
  "No awkward follow-up emails required.",
  "Your virtual HR department is working overtime.",
  "Another completely simulated hiring decision is complete.",
  "Imaginary inbox successfully cleared.",
  "The candidates remain fictional and emotionally unharmed.",
] as const;

const SHORTLIST_LINES = [
  "The fictional talent pipeline is thriving.",
  "Another résumé entered the imaginary maybe pile.",
  "Your pretend recruiting instincts are warming up.",
  "The virtual interview calendar remains completely empty.",
] as const;

const OFFER_SENT_LINES = [
  "Another fictional offer entered the universe.",
  "Compensation negotiations successfully avoided.",
  "Your imaginary legal department approved the offer.",
  "No recruiter approval chain was required.",
] as const;

const OFFER_RECEIVED_LINES = [
  "Another fictional offer entered the universe.",
  "Compensation negotiations successfully avoided.",
  "Your imaginary inbox is celebrating quietly.",
  "No recruiter approval chain was required.",
] as const;

const SAVED_JOB_LINES = [
  "Another opportunity safely stored for later.",
  "Your fictional career options are multiplying.",
  "The imaginary job board remembers everything.",
  "Saved for the version of you who checks bookmarks.",
] as const;

const COMBINED_LINES = [
  "Productivity level: questionably impressive.",
  "You completed several actions and attended zero meetings.",
  "Imaginary progress has reached measurable levels.",
  "Your fictional career ecosystem is flourishing.",
  "A suspicious amount of simulated work has been completed.",
  "Earned 50 imaginary productivity points.",
  "Saved approximately 0 real minutes.",
  "Increased fictional employability by 37%.",
  "Prevented 10 fake follow-up emails.",
  "Generated 12 units of career optimism.",
  "Burned 0 calories, but completed 10 fictional decisions.",
] as const;

const LINES_BY_CATEGORY: Record<MilestoneCategory, readonly string[]> = {
  applications: APPLICATION_LINES,
  rejections: REJECTION_LINES,
  shortlists: SHORTLIST_LINES,
  offers_sent: OFFER_SENT_LINES,
  offers_received: OFFER_RECEIVED_LINES,
  saved_jobs: SAVED_JOB_LINES,
  total: COMBINED_LINES,
};

export interface MilestoneCopy {
  title: string;
  body: string;
  playfulLine: string;
}

function pickPlayfulLine(category: MilestoneCategory, recent: readonly string[]): string {
  const pool = LINES_BY_CATEGORY[category];
  const available = pool.filter((line) => !recent.includes(line));
  const choices = available.length > 0 ? available : [...pool];
  // Deterministic-ish pick: prefer first unused, then rotate by recent length.
  const index = recent.length % choices.length;
  return choices[index] ?? choices[0]!;
}

function categoryLabel(category: MilestoneCategory, count: number): string {
  switch (category) {
    case "applications":
      return count === 1 ? "fictional application" : "fictional applications";
    case "rejections":
      return count === 1
        ? "fictional candidate rejection"
        : "fictional candidate rejections";
    case "shortlists":
      return count === 1 ? "fictional shortlist" : "fictional shortlists";
    case "offers_sent":
      return count === 1 ? "fictional offer sent" : "fictional offers sent";
    case "offers_received":
      return count === 1 ? "fictional offer received" : "fictional offers received";
    case "saved_jobs":
      return count === 1 ? "saved fictional job" : "saved fictional jobs";
    case "total":
      return count === 1 ? "fictional action" : "fictional actions";
  }
}

export function getToastCopy(
  category: MilestoneCategory,
  threshold: number,
  recentPlayfulLines: readonly string[],
): MilestoneCopy {
  const playfulLine = pickPlayfulLine(category, recentPlayfulLines);
  if (category === "applications") {
    return {
      title: "Application sprint complete",
      body: `${threshold} fictional applications sent.`,
      playfulLine,
    };
  }
  if (category === "rejections") {
    return {
      title: "Hiring sprint complete",
      body: `${threshold} fictional candidates reviewed.`,
      playfulLine,
    };
  }
  return {
    title: "Milestone unlocked",
    body: `${threshold} ${categoryLabel(category, threshold)} completed.`,
    playfulLine,
  };
}

export function getDialogCopy(
  category: MilestoneCategory,
  threshold: number,
  recentPlayfulLines: readonly string[],
): MilestoneCopy {
  const playfulLine = pickPlayfulLine(category, recentPlayfulLines);
  if (category === "applications" && threshold === 10) {
    return {
      title: "Double digits!",
      body: "You completed 10 fictional applications.",
      playfulLine,
    };
  }
  if (category === "rejections" && threshold === 10) {
    return {
      title: "Decision-maker unlocked",
      body: "You completed 10 fictional hiring decisions.",
      playfulLine,
    };
  }
  return {
    title: "Milestone reached",
    body: `You completed ${threshold} ${categoryLabel(category, threshold)}.`,
    playfulLine,
  };
}

export function getSummaryCopy(recentPlayfulLines: readonly string[]): MilestoneCopy {
  return {
    title: "OfferLoop activity summary",
    body: "50 fictional actions completed",
    playfulLine: pickPlayfulLine("total", recentPlayfulLines),
  };
}

export function getLiveAnnouncement(
  category: MilestoneCategory,
  threshold: number,
): string {
  return `Milestone reached. ${threshold} ${categoryLabel(category, threshold)} completed.`;
}

export { LINES_BY_CATEGORY };
