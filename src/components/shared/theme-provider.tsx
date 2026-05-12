"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

/**
 * ThemeProvider — wrapper around next-themes.
 *
 * Why a wrapper instead of using NextThemesProvider directly?
 *  - One import path for the rest of the app.
 *  - A single place to tweak defaults (attribute, transitions) if we
 *    change theme strategy later.
 *
 * Required in the root layout. Pair with `suppressHydrationWarning`
 * on <html> to silence the inevitable mismatch on first paint.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
