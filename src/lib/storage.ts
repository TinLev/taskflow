import type { z } from "zod";

/**
 * safeStorage — thin, type-safe wrapper around window.localStorage.
 *
 * Why a wrapper?
 *  1. Schema validation on read: garbage in storage (manual edits, schema
 *     drift, malicious user) won't crash the app — we fall back to defaults
 *     and log a warning instead of throwing.
 *  2. SSR-safe: every method no-ops when `window` is undefined.
 *  3. Centralized error handling: one place to swap for IndexedDB later.
 *
 * Note: this is intentionally NOT reactive. For reactivity, use the
 * `useLocalStorage` hook which subscribes to the `storage` event for
 * cross-tab sync.
 */
export const safeStorage = {
  get<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw) as unknown;
      const result = schema.safeParse(parsed);
      if (!result.success) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[storage] Schema mismatch for "${key}". Using fallback.`,
            result.error.issues,
          );
        }
        return fallback;
      }
      return result.data;
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[storage] Failed to read "${key}":`, err);
      }
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`[storage] Failed to write "${key}":`, err);
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },

  /** Clear all keys, or only keys starting with `prefix`. */
  clear(prefix?: string): void {
    if (typeof window === "undefined") return;
    if (!prefix) {
      window.localStorage.clear();
      return;
    }
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k?.startsWith(prefix)) toRemove.push(k);
    }
    for (const k of toRemove) window.localStorage.removeItem(k);
  },
};
