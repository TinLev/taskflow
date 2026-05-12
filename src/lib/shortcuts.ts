/**
 * Central shortcuts registry.
 *
 * Every keyboard shortcut bound anywhere in the app should live here.
 * ShortcutsHelpDialog renders this list automatically — adding a new
 * shortcut means: register it here, then wire its handler with
 * `useKeyboardShortcut(SHORTCUTS.SOMETHING.combo, handler)`.
 */
export interface Shortcut {
  /** Combo as accepted by `useKeyboardShortcut`. `mod` = Cmd on Mac, Ctrl elsewhere. */
  combo: string;
  /** Human-readable label shown in the help dialog. */
  label: string;
  /** Display-friendly key labels (e.g. ["⌘", "K"]). */
  keys: string[];
  /** Category for grouping in the help dialog. */
  category: "Navigation" | "Tasks" | "Workspace" | "General";
}

const isMac =
  typeof navigator !== "undefined" &&
  (navigator.userAgent.includes("Mac") || navigator.userAgent.includes("iPhone"));

const MOD = isMac ? "⌘" : "Ctrl";

export const SHORTCUTS = {
  COMMAND_PALETTE: {
    combo: "mod+k",
    label: "Mở command palette",
    keys: [MOD, "K"],
    category: "General",
  },
  HELP: {
    combo: "mod+/",
    label: "Xem danh sách shortcuts",
    keys: [MOD, "/"],
    category: "General",
  },
  NEW_TASK: {
    combo: "mod+n",
    label: "Tạo task mới (qua command palette)",
    keys: [MOD, "N"],
    category: "Tasks",
  },
  CLOSE: {
    combo: "esc",
    label: "Đóng modal / hủy",
    keys: ["Esc"],
    category: "General",
  },
} as const satisfies Record<string, Shortcut>;

export const ALL_SHORTCUTS: Shortcut[] = Object.values(SHORTCUTS);
