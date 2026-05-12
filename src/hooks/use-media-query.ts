"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * useMediaQuery — subscribes to a CSS media query via `useSyncExternalStore`.
 *
 * Why useSyncExternalStore?
 *  - It's React 18+'s blessed API for external subscriptions: no setState
 *    in effects, no tearing during concurrent renders, no manual cleanup.
 *  - Returns the SSR snapshot (`false`) on the server, then the live value
 *    after hydration — no flicker as long as you also gate visual changes
 *    behind Tailwind responsive classes when possible.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* ───────────────────────────────────────────────────────────────
 * Convenience hooks for Tailwind breakpoints.
 * Each calls useMediaQuery unconditionally — hook rules satisfied.
 * ─────────────────────────────────────────────────────────── */
export function useIsMobile(): boolean {
  return !useMediaQuery("(min-width: 768px)");
}

export function useIsTablet(): boolean {
  const md = useMediaQuery("(min-width: 768px)");
  const lg = useMediaQuery("(min-width: 1024px)");
  return md && !lg;
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
