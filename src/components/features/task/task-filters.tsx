"use client";

import { ArrowDownUp, Filter, Search, X } from "lucide-react";
import { useMemo } from "react";

import { TaskPriorityIcon } from "@/components/features/task/task-priority-icon";
import { TaskStatusBadge } from "@/components/features/task/task-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/types";
import { useTaskFilters, type TaskSortKey } from "@/hooks/use-task-filters";

const SORT_LABELS: Record<TaskSortKey, string> = {
  created: "Mới tạo",
  due: "Due date",
  priority: "Priority",
  title: "Tên (A-Z)",
};

interface TaskFiltersProps {
  /** All tasks in the current view — used to compute available tag chips. */
  tasks: Task[];
  /** Hide the sort control (Kanban uses its own column order). */
  hideSort?: boolean;
  className?: string;
}

export function TaskFilters({ tasks, hideSort, className }: TaskFiltersProps) {
  const { filters, setFilter, reset, activeCount } = useTaskFilters();

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const t of tasks) for (const tag of t.tags) set.add(tag);
    return Array.from(set).sort();
  }, [tasks]);

  function toggleArrayValue<T extends string>(
    current: T[],
    value: T,
    key: "status" | "priority" | "tags",
  ) {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setFilter(key, next as never);
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Search */}
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          type="search"
          value={filters.q}
          onChange={(e) => setFilter("q", e.target.value)}
          placeholder="Search task..."
          className="h-9 pl-9"
        />
      </div>

      {/* Status */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter className="size-3.5" />
            Status
            {filters.status.length > 0 && (
              <span className="bg-secondary text-secondary-foreground ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold">
                {filters.status.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {TASK_STATUSES.map((s) => (
            <DropdownMenuCheckboxItem
              key={s.id}
              checked={filters.status.includes(s.id)}
              onCheckedChange={() => toggleArrayValue<TaskStatus>(filters.status, s.id, "status")}
            >
              <TaskStatusBadge status={s.id} size="sm" />
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Priority */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter className="size-3.5" />
            Priority
            {filters.priority.length > 0 && (
              <span className="bg-secondary text-secondary-foreground ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold">
                {filters.priority.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuLabel>Lọc theo priority</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {TASK_PRIORITIES.map((p) => (
            <DropdownMenuCheckboxItem
              key={p.id}
              checked={filters.priority.includes(p.id)}
              onCheckedChange={() =>
                toggleArrayValue<TaskPriority>(filters.priority, p.id, "priority")
              }
            >
              <span className="inline-flex items-center gap-1.5">
                <TaskPriorityIcon priority={p.id} />
                {p.label}
              </span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Tags (only if there are any) */}
      {allTags.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="size-3.5" />
              Tags
              {filters.tags.length > 0 && (
                <span className="bg-secondary text-secondary-foreground ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold">
                  {filters.tags.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-72 w-44 overflow-y-auto">
            <DropdownMenuLabel>Lọc theo tag</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={filters.tags.includes(tag)}
                onCheckedChange={() => toggleArrayValue<string>(filters.tags, tag, "tags")}
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Sort */}
      {!hideSort && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowDownUp className="size-3.5" />
              {SORT_LABELS[filters.sort]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Sắp xếp</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={filters.sort}
              onValueChange={(v) => setFilter("sort", v as TaskSortKey)}
            >
              {(Object.keys(SORT_LABELS) as TaskSortKey[]).map((key) => (
                <DropdownMenuRadioItem key={key} value={key}>
                  {SORT_LABELS[key]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5">
          <X className="size-3.5" />
          Xóa lọc
        </Button>
      )}
    </div>
  );
}
