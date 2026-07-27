import type { Job, JobWithOrganization } from "@/types/domain";
import { formatCompactCurrency } from "./currency";

const START_DATE_OFFSET_DAYS = 21;

/**
 * Deterministic-ish fictional start date: a few weeks out from "today", offset
 * slightly by the job id so different offers don't all land on the same date.
 */
export function generateFictionalStartDate(
  jobId: string,
  from: Date = new Date(),
): string {
  let hash = 0;
  for (let i = 0; i < jobId.length; i += 1) {
    hash = (hash * 31 + jobId.charCodeAt(i)) % 1000;
  }
  const offsetDays = START_DATE_OFFSET_DAYS + (hash % 14);
  const date = new Date(from);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function generateOfferMessage(
  job: Pick<Job, "title"> & { organizationName: string },
  recipientDisplayName: string,
): string {
  return `Congratulations, ${recipientDisplayName}! ${job.organizationName} would be thrilled to welcome you as a ${job.title} in the OfferLoop simulation. Your fictional background impressed our imaginary hiring team, and we are excited to present this simulated offer. This is an entertainment experience. It is not a real employment offer and has no legal or financial value.`;
}

export function generateOfferId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
  }
  return `OL-${hash.toString(36).toUpperCase().padStart(6, "0")}`;
}

export function formatOfferSalaryLine(
  job: Pick<JobWithOrganization, "salaryMin" | "salaryMax" | "currency">,
): string {
  return `${formatCompactCurrency(job.salaryMin, job.currency)}–${formatCompactCurrency(job.salaryMax, job.currency)} / year (fictional)`;
}
