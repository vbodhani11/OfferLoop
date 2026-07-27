"use client";

import { useEffect, useState } from "react";

/** Tracks Page Visibility so decorative animations can pause off-screen/off-tab. */
export function useTabVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const handler = () => setVisible(document.visibilityState === "visible");
    handler();
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  return visible;
}
