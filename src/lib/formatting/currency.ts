export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats a fictional salary range. Values under 1000 are treated as hourly
 * (used for internships) and rendered with `/hr`.
 */
export function formatSalaryRange(min: number, max: number, currency = "USD"): string {
  const isHourly = max < 1000;
  if (isHourly) {
    return `${formatCurrency(min, currency)}–${formatCurrency(max, currency)}/hr`;
  }
  return `${formatCompactCurrency(min, currency)}–${formatCompactCurrency(max, currency)}`;
}

export function formatCompactCurrency(value: number, currency = "USD"): string {
  if (value >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return formatCurrency(value, currency);
}

export function formatRelativeDays(daysAgo: number): string {
  if (daysAgo <= 0) return "Simulated today";
  if (daysAgo === 1) return "Simulated 1 day ago";
  if (daysAgo < 7) return `Simulated ${daysAgo} days ago`;
  const weeks = Math.round(daysAgo / 7);
  if (weeks < 5) return `Simulated ${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.round(daysAgo / 30);
  return `Simulated ${months} month${months > 1 ? "s" : ""} ago`;
}

export function formatDate(dateIso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateIso));
}
