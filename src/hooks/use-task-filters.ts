"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import type { Task, TaskPriority, TaskStatus } from "@/types";

export type TaskSortKey = "created" | "due" | "priority" | "title";
const DEFAULT_SORT: TaskSortKey = "created";

export interface TaskFilters {
  q: string;
  status: TaskStatus[];
  priority: TaskPriority[];
  tags: string[];
  sort: TaskSortKey;
}

const VALID_STATUS = new Set<string>(TASK_STATUSES.map((s) => s.id));
const VALID_PRIORITY = new Set<string>(TASK_PRIORITIES.map((p) => p.id));
const VALID_SORT = new Set<TaskSortKey>(["created", "due", "priority", "title"]);

function parseList<T extends string>(raw: string | null, validator: (s: string) => s is T): T[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .filter(validator);
}

const isStatus = (s: string): s is TaskStatus => VALID_STATUS.has(s);
const isPriority = (s: string): s is TaskPriority => VALID_PRIORITY.has(s);

/**
 * useTaskFilters — URL-backed filter & sort state for task views.
 *
 * State lives in the URL query string so:
 *  - Refresh / share preserves the view.
 *  - Browser back/forward navigates filter changes.
 *  - No client state to sync, no race with the address bar.
 *
 * Returns `{ filters, setFilter, applyFilters }`. `applyFilters` is a
 * pure function so callers can memoize the result.
 */
export function useTaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<TaskFilters>(() => {
    const sortRaw = searchParams.get("sort") ?? DEFAULT_SORT;
    return {
      q: searchParams.get("q") ?? "",
      status: parseList(searchParams.get("status"), isStatus),
      priority: parseList(searchParams.get("priority"), isPriority),
      tags: parseList(searchParams.get("tags"), (s): s is string => s.length > 0),
      sort: VALID_SORT.has(sortRaw as TaskSortKey) ? (sortRaw as TaskSortKey) : DEFAULT_SORT,
    };
  }, [searchParams]);

  const setFilter = useCallback(
    <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
      const next = new URLSearchParams(searchParams.toString());

      if (Array.isArray(value)) {
        if (value.length === 0) next.delete(key);
        else next.set(key, value.join(","));
      } else if (value === "" || value === DEFAULT_SORT) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const reset = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const activeCount =
    (filters.q ? 1 : 0) +
    (filters.status.length > 0 ? 1 : 0) +
    (filters.priority.length > 0 ? 1 : 0) +
    (filters.tags.length > 0 ? 1 : 0);

  return { filters, setFilter, reset, activeCount };
}

/**
 * applyTaskFilters — pure helper that filters + sorts tasks.
 * Exported separately so views can memoize with their own deps.
 */
export function applyTaskFilters(tasks: Task[], filters: TaskFilters): Task[] {
  const q = filters.q.trim().toLowerCase();
  let result = tasks;

  if (q) {
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }
  if (filters.status.length > 0) {
    const set = new Set(filters.status);
    result = result.filter((t) => set.has(t.status));
  }
  if (filters.priority.length > 0) {
    const set = new Set(filters.priority);
    result = result.filter((t) => set.has(t.priority));
  }
  if (filters.tags.length > 0) {
    const set = new Set(filters.tags);
    result = result.filter((t) => t.tags.some((tag) => set.has(tag)));
  }

  return [...result].sort((a, b) => compareTasks(a, b, filters.sort));
}

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function compareTasks(a: Task, b: Task, key: TaskSortKey): number {
  switch (key) {
    case "title":
      return a.title.localeCompare(b.title);
    case "priority":
      return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    case "due": {
      // Tasks without a due date sort to the bottom regardless of order.
      const ad = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const bd = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      return ad - bd;
    }
    case "created":
    default:
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }
}
