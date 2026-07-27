import type { z } from "zod";

function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__offerloop_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads and validates a JSON value from localStorage. Never throws: on any
 * failure (unavailable storage, invalid JSON, schema mismatch) it clears the
 * offending key and returns `fallback`.
 */
export function safeReadLocalStorage<T>(
  key: string,
  schema: z.ZodType<T>,
  fallback: T,
): T {
  if (!isLocalStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    if (!result.success) {
      window.localStorage.removeItem(key);
      return fallback;
    }
    return result.data;
  } catch {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* no-op: storage already unavailable */
    }
    return fallback;
  }
}

export function safeWriteLocalStorage<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function safeRemoveLocalStorage(key: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

export { isLocalStorageAvailable };
