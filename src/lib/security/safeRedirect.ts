const ALLOWED_REDIRECT_PATHS = new Set([
  "/",
  "/accept",
  "/reject",
  "/offers",
  "/saved",
  "/profile",
  "/settings",
]);

/**
 * Only allows redirecting to a known, relative, same-origin app route.
 * Prevents open-redirect abuse via `?next=` style query parameters.
 */
export function safeRedirectPath(candidate: string | null | undefined): string {
  if (!candidate) return "/";
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return "/";
  const [path] = candidate.split("?");
  if (ALLOWED_REDIRECT_PATHS.has(path)) return candidate;
  return "/";
}
