import type { TaskPriority, TaskStatus } from "@/types";

/* ───────────────────────────────────────────────────────────────
 * localStorage keys — all prefixed to avoid collision with other
 * apps on the same origin during local dev.
 * ─────────────────────────────────────────────────────────── */
export const STORAGE_KEYS = {
  USER: "taskflow:user",
  USERS: "taskflow:users",
  WORKSPACES: "taskflow:workspaces",
  PROJECTS: "taskflow:projects",
  TASKS: "taskflow:tasks",
  ACTIVE_WORKSPACE: "taskflow:active_workspace",
  ONBOARDED: "taskflow:onboarded",
} as const;

/* ───────────────────────────────────────────────────────────────
 * Demo account — pre-seeded so recruiters can test without signing up.
 * ─────────────────────────────────────────────────────────── */
export const DEMO_CREDENTIALS = {
  email: "demo@taskflow.app",
  password: "demo1234",
} as const;

/* ───────────────────────────────────────────────────────────────
 * Display config for statuses & priorities.
 * Lookup-by-id avoids switch statements scattered across components.
 * ─────────────────────────────────────────────────────────── */
export interface StatusConfig {
  id: TaskStatus;
  label: string;
  /** Tailwind classes for badge/dot — references CSS vars in globals.css */
  badgeClass: string;
  dotClass: string;
}

export const TASK_STATUSES: readonly StatusConfig[] = [
  {
    id: "backlog",
    label: "Backlog",
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground/60",
  },
  {
    id: "todo",
    label: "Todo",
    badgeClass: "bg-secondary text-secondary-foreground border-border",
    dotClass: "bg-zinc-400",
  },
  {
    id: "in_progress",
    label: "In Progress",
    badgeClass: "bg-info/15 text-info border-info/30",
    dotClass: "bg-info",
  },
  {
    id: "review",
    label: "Review",
    badgeClass: "bg-warning/15 text-warning border-warning/30",
    dotClass: "bg-warning",
  },
  {
    id: "done",
    label: "Done",
    badgeClass: "bg-success/15 text-success border-success/30",
    dotClass: "bg-success",
  },
] as const;

export interface PriorityConfig {
  id: TaskPriority;
  label: string;
  /** Order weight for sorting (urgent highest) */
  weight: number;
  badgeClass: string;
  iconClass: string;
}

export const TASK_PRIORITIES: readonly PriorityConfig[] = [
  {
    id: "low",
    label: "Low",
    weight: 1,
    badgeClass: "bg-priority-low/15 text-priority-low border-priority-low/30",
    iconClass: "text-priority-low",
  },
  {
    id: "medium",
    label: "Medium",
    weight: 2,
    badgeClass: "bg-priority-medium/15 text-priority-medium border-priority-medium/30",
    iconClass: "text-priority-medium",
  },
  {
    id: "high",
    label: "High",
    weight: 3,
    badgeClass: "bg-priority-high/15 text-priority-high border-priority-high/30",
    iconClass: "text-priority-high",
  },
  {
    id: "urgent",
    label: "Urgent",
    weight: 4,
    badgeClass: "bg-priority-urgent/15 text-priority-urgent border-priority-urgent/30",
    iconClass: "text-priority-urgent",
  },
] as const;

/* ───────────────────────────────────────────────────────────────
 * Project colors palette — used in project creation form.
 * ─────────────────────────────────────────────────────────── */
export const PROJECT_COLORS: readonly string[] = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#64748b", // slate
] as const;

/* ───────────────────────────────────────────────────────────────
 * Lookup helpers — O(1) reads, used in card/badge components.
 * ─────────────────────────────────────────────────────────── */
export const STATUS_BY_ID = Object.fromEntries(TASK_STATUSES.map((s) => [s.id, s])) as Record<
  TaskStatus,
  StatusConfig
>;

export const PRIORITY_BY_ID = Object.fromEntries(TASK_PRIORITIES.map((p) => [p.id, p])) as Record<
  TaskPriority,
  PriorityConfig
>;
