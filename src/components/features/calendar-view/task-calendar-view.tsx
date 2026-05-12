"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { TaskFilters } from "@/components/features/task/task-filters";
import { TaskModal } from "@/components/features/task/task-modal";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/contexts/task-context";
import { STATUS_BY_ID } from "@/lib/constants";
import { applyTaskFilters, useTaskFilters } from "@/hooks/use-task-filters";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskCalendarViewProps {
  projectId: string;
}

export function TaskCalendarView({ projectId }: TaskCalendarViewProps) {
  const { getTasksByProject } = useTasks();
  const { filters } = useTaskFilters();

  const [cursorDate, setCursorDate] = useState(new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState<Date | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const allTasks = useMemo(() => getTasksByProject(projectId), [getTasksByProject, projectId]);

  const filteredTasks = useMemo(() => applyTaskFilters(allTasks, filters), [allTasks, filters]);

  const days = useMemo(() => {
    // Build a 6-week grid starting from the Sunday before the month's
    // first day. Always 42 cells for a stable layout.
    const monthStart = startOfMonth(cursorDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday-first
    const gridEnd = endOfWeek(endOfMonth(cursorDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursorDate]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of filteredTasks) {
      if (!t.dueDate) continue;
      const key = format(new Date(t.dueDate), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [filteredTasks]);

  const tasksNoDueDate = useMemo(() => filteredTasks.filter((t) => !t.dueDate), [filteredTasks]);

  function openCreateAtDay(date: Date) {
    setCreateDate(date);
    setCreateOpen(true);
  }

  const weekdayLabels = useMemo(() => {
    // Generate labels using a known Monday-Sunday week from date-fns.
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return format(d, "EEE", { locale: vi });
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCursorDate(subMonths(cursorDate, 1))}
            aria-label="Tháng trước"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="min-w-[8ch] text-lg font-semibold tracking-tight capitalize">
            {format(cursorDate, "LLLL yyyy", { locale: vi })}
          </h2>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCursorDate(addMonths(cursorDate, 1))}
            aria-label="Tháng sau"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCursorDate(new Date())}>
            Hôm nay
          </Button>
        </div>
        <TaskFilters tasks={allTasks} hideSort className="flex-1 justify-end" />
      </div>

      <div className="border-border/60 overflow-hidden rounded-lg border">
        {/* Weekday header */}
        <div className="border-border/60 bg-muted/50 text-muted-foreground grid grid-cols-7 border-b text-xs font-medium tracking-wide uppercase">
          {weekdayLabels.map((label) => (
            <div key={label} className="p-2 text-center capitalize">
              {label}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 grid-rows-6">
          {days.map((day, idx) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDay.get(dayKey) ?? [];
            const inMonth = isSameMonth(day, cursorDate);
            const today = isToday(day);

            return (
              <div
                key={dayKey}
                className={cn(
                  "group border-border/60 relative min-h-[100px] border-r border-b p-1.5",
                  // Last column has no right border
                  idx % 7 === 6 && "border-r-0",
                  // Last row has no bottom border
                  idx >= 35 && "border-b-0",
                  !inMonth && "bg-muted/20",
                  today && "bg-info/5",
                )}
                onClick={() => openCreateAtDay(day)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") openCreateAtDay(day);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Ngày ${format(day, "dd/MM/yyyy")} — ${dayTasks.length} task`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      !inMonth && "text-muted-foreground/50",
                      today &&
                        "bg-info text-info-foreground inline-flex size-5 items-center justify-center rounded-full text-[11px]",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreateAtDay(day);
                    }}
                    className="text-muted-foreground hover:bg-secondary/60 hover:text-foreground rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Thêm task ngày này"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>

                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task) => {
                    const statusConfig = STATUS_BY_ID[task.status];
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTask(task);
                        }}
                        className={cn(
                          "bg-background hover:bg-secondary block w-full truncate rounded border-l-2 px-1 py-0.5 text-left text-[11px] transition-colors",
                          task.status === "done" && "text-muted-foreground line-through",
                        )}
                        style={{
                          borderLeftColor: `var(--${statusConfig.dotClass.replace("bg-", "")})`,
                        }}
                      >
                        {task.title}
                      </button>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <span className="text-muted-foreground block px-1 text-[10px]">
                      +{dayTasks.length - 3} task
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* No-due-date tasks footer */}
      {tasksNoDueDate.length > 0 && (
        <div className="border-border/60 bg-card/30 rounded-lg border p-4">
          <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
            Không có due date ({tasksNoDueDate.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {tasksNoDueDate.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => setEditingTask(task)}
                className={cn(
                  "bg-background hover:border-foreground/15 border-border/60 max-w-xs truncate rounded-md border px-2 py-1 text-left text-xs transition-colors",
                  task.status === "done" && "text-muted-foreground line-through",
                )}
              >
                {task.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <TaskModal
        mode="create"
        projectId={projectId}
        defaults={createDate ? { dueDate: createDate } : undefined}
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setCreateDate(undefined);
        }}
      />
      {editingTask && (
        <TaskModal
          mode="edit"
          task={editingTask}
          open={editingTask !== null}
          onOpenChange={(open) => !open && setEditingTask(null)}
        />
      )}
    </div>
  );
}
