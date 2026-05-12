"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { safeStorage } from "@/lib/storage";

type Updater<T> = (prev: T) => T;

/**
 * useLocalStorage — reactive, type-safe localStorage with cross-tab sync.
 *
 * SSR contract: returns `initialValue` on the server and during the first
 * client render. Reads from localStorage only after mount via useEffect.
 * This avoids React 19 hydration mismatches.
 *
 * Returns `[value, setValue, remove]`.
 */
export function useLocalStorage<T>(
  key: string,
  schema: z.ZodType<T>,
  initialValue: T,
): [T, (next: T | Updater<T>) => void, () => void] {
  const [value, setValue] = useState<T>(initialValue);

  // Mutable refs to latest schema/initial, kept fresh via useEffect so we
  // don't violate the "no ref writes during render" rule.
  const schemaRef = useRef(schema);
  const initialRef = useRef(initialValue);
  useEffect(() => {
    schemaRef.current = schema;
    initialRef.current = initialValue;
  }, [schema, initialValue]);

  // Hydrate from storage after mount.
  useEffect(() => {
    setValue(safeStorage.get(key, schemaRef.current, initialRef.current));
  }, [key]);

  const update = useCallback(
    (next: T | Updater<T>) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as Updater<T>)(prev) : next;
        safeStorage.set(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    safeStorage.remove(key);
    setValue(initialRef.current);
  }, [key]);

  // Cross-tab sync: react to changes from other tabs/windows.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== key) return;
      if (e.newValue === null) {
        setValue(initialRef.current);
        return;
      }
      try {
        const parsed = JSON.parse(e.newValue) as unknown;
        const result = schemaRef.current.safeParse(parsed);
        if (result.success) setValue(result.data);
      } catch {
        // Ignore — keep current state on malformed cross-tab updates.
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  return [value, update, remove];
}
