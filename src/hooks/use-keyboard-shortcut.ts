"use client";

import { useEffect, useRef } from "react";

interface ShortcutOptions {
  /** Call preventDefault() on the event when matched. Default: true. */
  preventDefault?: boolean;
  /** Fire even when focus is inside <input>, <textarea>, or contentEditable. Default: false. */
  enableInInput?: boolean;
  /** Disable the shortcut entirely (e.g. when a modal is closed). Default: false. */
  disabled?: boolean;
}

const isMac =
  typeof navigator !== "undefined" &&
  (navigator.userAgent.includes("Mac") || navigator.userAgent.includes("iPhone"));

/**
 * useKeyboardShortcut — bind a keyboard combo to a handler.
 *
 * Combo syntax: `"mod+k"`, `"shift+/"`, `"esc"`, `"mod+shift+n"`.
 *
 *   - `mod` → Cmd on Mac, Ctrl elsewhere (the canonical "primary modifier")
 *   - `cmd` / `meta` → ⌘ only
 *   - `ctrl` → Control only
 *   - `shift`, `alt` (alias `option`) → as expected
 *
 * The handler is kept in a ref (synced inside an effect) so the latest
 * closure is always invoked without re-binding the global listener.
 */
export function useKeyboardShortcut(
  combo: string,
  handler: (e: KeyboardEvent) => void,
  options: ShortcutOptions = {},
): void {
  const { preventDefault = true, enableInInput = false, disabled = false } = options;

  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (disabled) return;

    function onKeyDown(e: KeyboardEvent) {
      if (!enableInInput && isTypingInInput(e.target)) return;
      if (!matchesCombo(e, combo)) return;
      if (preventDefault) e.preventDefault();
      handlerRef.current(e);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [combo, preventDefault, enableInInput, disabled]);
}

function isTypingInInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

function matchesCombo(e: KeyboardEvent, combo: string): boolean {
  const parts = combo
    .toLowerCase()
    .split("+")
    .map((p) => p.trim());
  const key = parts[parts.length - 1];
  if (!key) return false;
  const modifiers = new Set(parts.slice(0, -1));

  const wantMod = modifiers.has("mod");
  const wantCtrl = modifiers.has("ctrl") || (wantMod && !isMac);
  const wantMeta = modifiers.has("cmd") || modifiers.has("meta") || (wantMod && isMac);
  const wantShift = modifiers.has("shift");
  const wantAlt = modifiers.has("alt") || modifiers.has("option");

  const normalizedKey = key === "esc" ? "escape" : key === "space" ? " " : key;

  return (
    e.ctrlKey === wantCtrl &&
    e.metaKey === wantMeta &&
    e.shiftKey === wantShift &&
    e.altKey === wantAlt &&
    e.key.toLowerCase() === normalizedKey
  );
}
