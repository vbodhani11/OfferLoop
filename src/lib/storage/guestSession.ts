import { STORAGE_KEYS } from "@/lib/constants/storageKeys";
import { safeReadLocalStorage, safeWriteLocalStorage } from "./safeLocalStorage";
import { z } from "zod";

const sessionIdSchema = z.string().min(1);

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateGuestSessionId(): string {
  const existing = safeReadLocalStorage(STORAGE_KEYS.guestSessionId, sessionIdSchema, "");
  if (existing) return existing;
  const created = generateSessionId();
  safeWriteLocalStorage(STORAGE_KEYS.guestSessionId, created);
  return created;
}
