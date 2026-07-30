export const STORAGE_KEYS = {
  guestProfile: "offerloop_guest_profile_v1",
  guestOffers: "offerloop_guest_offers_v1",
  guestSavedJobs: "offerloop_guest_saved_jobs_v1",
  guestActions: "offerloop_guest_actions_v1",
  guestSettings: "offerloop_guest_settings_v1",
  guestApplications: "offerloop_guest_applications_v1",
  guestSessionId: "offerloop_guest_session_id_v1",
  pwaInstallDismissed: "offerloop_pwa_install_dismissed_v1",
  pwaMilestone: "offerloop_pwa_milestone_v1",
  /** Lifetime category counts, unlocked achievements, displayed milestone keys. */
  milestonesLifetime: "offerloop_milestones_v1",
  /** Milestone celebration settings (on/off, sound, achievement toasts). */
  milestoneSettings: "offerloop_milestone_settings_v1",
  /** Per-browser-tab session progress (sessionStorage). */
  milestoneSession: "offerloop_milestone_session_v1",
} as const;

export const SIMULATION_VERSION = "1.0.0";
