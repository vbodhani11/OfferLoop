"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getOrCreateGuestSessionId } from "@/lib/storage/guestSession";
import { readGuestProfile, writeGuestProfile } from "@/lib/storage/guestStore";

interface GuestSessionContextValue {
  anonymousSessionId: string;
  displayName: string;
  setDisplayName: (name: string) => void;
}

const GuestSessionContext = createContext<GuestSessionContextValue | null>(null);

export function GuestSessionProvider({ children }: { children: ReactNode }) {
  const [anonymousSessionId, setAnonymousSessionId] = useState("");
  const [displayName, setDisplayNameState] = useState("Future You");

  useEffect(() => {
    // Reading localStorage must happen after mount to avoid an SSR/client
    // hydration mismatch (the server has no access to localStorage). This
    // effect runs exactly once on mount, so it does not cause cascading
    // re-renders despite triggering React's set-state-in-effect check.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnonymousSessionId(getOrCreateGuestSessionId());
    setDisplayNameState(readGuestProfile().displayName);
  }, []);

  const value = useMemo<GuestSessionContextValue>(
    () => ({
      anonymousSessionId,
      displayName,
      setDisplayName: (name: string) => {
        const trimmed = name.trim() || "Future You";
        setDisplayNameState(trimmed);
        writeGuestProfile({ ...readGuestProfile(), displayName: trimmed });
      },
    }),
    [anonymousSessionId, displayName],
  );

  return (
    <GuestSessionContext.Provider value={value}>{children}</GuestSessionContext.Provider>
  );
}

export function useGuestSession(): GuestSessionContextValue {
  const ctx = useContext(GuestSessionContext);
  if (!ctx) throw new Error("useGuestSession must be used within GuestSessionProvider");
  return ctx;
}
