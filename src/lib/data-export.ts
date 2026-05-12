import { z } from "zod";

import { STORAGE_KEYS } from "@/lib/constants";
import { safeStorage } from "@/lib/storage";
import { ProjectsSchema, TasksSchema, UserSchema, WorkspacesSchema } from "@/lib/validations";
import type { Project, Task, User, Workspace } from "@/types";

const CURRENT_VERSION = 1;

/* ───────────────────────────────────────────────────────────────
 * Export schema — drives both encode (write) and decode (import).
 * Bumping `version` lets us add migrations later without breaking
 * older exports.
 * ─────────────────────────────────────────────────────────── */
export const ExportPayloadSchema = z.object({
  version: z.literal(CURRENT_VERSION),
  exportedAt: z.coerce.date(),
  user: UserSchema.nullable(),
  workspaces: WorkspacesSchema,
  projects: ProjectsSchema,
  tasks: TasksSchema,
});

export type ExportPayload = z.infer<typeof ExportPayloadSchema>;

/* ───────────────────────────────────────────────────────────────
 * Build payload from current localStorage tables.
 * ─────────────────────────────────────────────────────────── */
function buildPayload(): ExportPayload {
  const user = safeStorage.get<User | null>(STORAGE_KEYS.USER, UserSchema, null);
  const workspaces = safeStorage.get<Workspace[]>(STORAGE_KEYS.WORKSPACES, WorkspacesSchema, []);
  const projects = safeStorage.get<Project[]>(STORAGE_KEYS.PROJECTS, ProjectsSchema, []);
  const tasks = safeStorage.get<Task[]>(STORAGE_KEYS.TASKS, TasksSchema, []);

  return {
    version: CURRENT_VERSION,
    exportedAt: new Date(),
    user,
    workspaces,
    projects,
    tasks,
  };
}

/* ───────────────────────────────────────────────────────────────
 * Trigger a JSON file download in the browser.
 * Uses an in-memory Blob + temporary <a> click — no library needed.
 * ─────────────────────────────────────────────────────────── */
export function downloadDataExport(): void {
  if (typeof window === "undefined") return;
  const payload = buildPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const ts = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
  a.download = `taskflow-export-${ts}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
}

/* ───────────────────────────────────────────────────────────────
 * Export only tasks as CSV. Useful for spreadsheets / sharing.
 * ─────────────────────────────────────────────────────────── */
export function downloadTasksCSV(): void {
  if (typeof window === "undefined") return;
  const tasks = safeStorage.get<Task[]>(STORAGE_KEYS.TASKS, TasksSchema, []);
  const projects = safeStorage.get<Project[]>(STORAGE_KEYS.PROJECTS, ProjectsSchema, []);
  const projectMap = new Map(projects.map((p) => [p.id, p.name] as const));

  const header = [
    "Title",
    "Description",
    "Project",
    "Status",
    "Priority",
    "Due date",
    "Tags",
    "Subtasks done",
    "Subtasks total",
    "Created at",
    "Updated at",
  ];

  const rows = tasks.map((t) => [
    csvCell(t.title),
    csvCell(t.description ?? ""),
    csvCell(projectMap.get(t.projectId) ?? t.projectId),
    t.status,
    t.priority,
    t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : "",
    csvCell(t.tags.join(", ")),
    String(t.subtasks.filter((s) => s.completed).length),
    String(t.subtasks.length),
    new Date(t.createdAt).toISOString(),
    new Date(t.updatedAt).toISOString(),
  ]);

  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const ts = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
  a.download = `taskflow-tasks-${ts}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
}

/** Escape a value for CSV: wrap in quotes if it contains comma/quote/newline. */
function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/* ───────────────────────────────────────────────────────────────
 * Import — parse + validate a JSON file, then REPLACE the
 * matching tables in localStorage.
 *
 * Returns `{ ok, error?, counts? }`. Caller is responsible for
 * triggering a refresh (the cleanest UX is a full page reload so
 * every provider rehydrates from the new storage state).
 * ─────────────────────────────────────────────────────────── */
export type ImportResult =
  | { ok: true; counts: { workspaces: number; projects: number; tasks: number } }
  | { ok: false; error: string };

export function importDataFromJSON(json: unknown): ImportResult {
  const parsed = ExportPayloadSchema.safeParse(json);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      ok: false,
      error: firstIssue
        ? `Schema không hợp lệ: ${firstIssue.path.join(".")} — ${firstIssue.message}`
        : "File JSON không đúng định dạng",
    };
  }

  const { workspaces, projects, tasks } = parsed.data;
  // Replace strategy (not merge) — keeps behavior predictable.
  safeStorage.set(STORAGE_KEYS.WORKSPACES, workspaces);
  safeStorage.set(STORAGE_KEYS.PROJECTS, projects);
  safeStorage.set(STORAGE_KEYS.TASKS, tasks);

  return {
    ok: true,
    counts: {
      workspaces: workspaces.length,
      projects: projects.length,
      tasks: tasks.length,
    },
  };
}

/** Read a File (from <input type="file">) and parse as JSON. */
export function readJSONFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        resolve(JSON.parse(text));
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Lỗi parse JSON"));
      }
    };
    reader.onerror = () => reject(new Error("Lỗi đọc file"));
    reader.readAsText(file);
  });
}
