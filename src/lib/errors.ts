export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

const GENERIC_MESSAGES: Record<string, string> = {
  OFFER_SAVE_FAILED:
    "We created your fictional offer, but could not save it. Try saving again.",
  APPLICATION_CREATE_FAILED:
    "We could not start your fictional application. Please try again.",
  SAVE_JOB_FAILED: "We could not save this fictional job. Please try again.",
  PROFILE_UPDATE_FAILED: "We could not update your profile. Please try again.",
};

/** Maps a caught error to a safe, actionable message — never a raw stack trace or SQL error. */
export function toSafeErrorMessage(error: unknown): string {
  if (error instanceof Error && GENERIC_MESSAGES[error.message]) {
    return GENERIC_MESSAGES[error.message];
  }
  return "Something went wrong on our (fictional) end. Please try again.";
}
