"use client";

import { useEffect, useState } from "react";

/**
 * useDebounce — returns a value that updates only after `delay` ms
 * of stability. Useful for search inputs to avoid filtering on every
 * keystroke.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
