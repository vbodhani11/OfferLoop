export type AnalyticsEvent =
  | "homepage_viewed"
  | "accept_mode_opened"
  | "reject_mode_opened"
  | "job_viewed"
  | "job_saved"
  | "fictional_application_started"
  | "fictional_offer_created"
  | "offer_celebrated"
  | "candidate_rejected"
  | "candidate_shortlisted"
  | "candidate_simulated_offer_created"
  | "guest_migration_completed"
  | "pwa_install_prompt_shown"
  | "pwa_installed";

function isAnalyticsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
}

/**
 * Privacy-friendly analytics abstraction: disabled by default, and only ever
 * sends the fixed event name plus non-identifying numeric/boolean properties.
 * Never pass names, emails, candidate identities, or free-form text here.
 *
 * To wire up a real provider later (e.g. Plausible or Umami), replace the body
 * of this function only — call sites never need to change.
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean>,
): void {
  if (!isAnalyticsEnabled()) return;
  if (typeof window === "undefined") return;
  console.info("[analytics]", event, properties ?? {});
}
