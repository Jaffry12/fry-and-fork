"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { currentStatus, STATUS_FALLBACK, type OpeningStatus } from "@/lib/hours";

/** Live open/closed status, worked out in the browser (UK time) and refreshed every minute. */
const StatusContext = createContext<OpeningStatus | null>(null);

export function StatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<OpeningStatus | null>(null);

  useEffect(() => {
    const tick = () => {
      const s = currentStatus();
      setStatus(s);
      // The status dots are coloured from this attribute (see globals.css).
      document.documentElement.setAttribute("data-status", s.state);
    };
    tick();
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return <StatusContext.Provider value={status}>{children}</StatusContext.Provider>;
}

export function useStatus(): OpeningStatus | null {
  return useContext(StatusContext);
}

/** "Open now · until 10:30pm" (or the fallback until the page has loaded). */
export function StatusLong() {
  const status = useStatus();
  return <span data-status-long>{status ? status.long : STATUS_FALLBACK}</span>;
}
