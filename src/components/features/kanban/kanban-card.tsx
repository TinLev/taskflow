"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ListChecks } from "lucide-react";
import { useState } from "react";

import { TaskDueBadge } from "@/components/features/task/task-due-badge";
import { TaskModal } from "@/components/features/task/task-modal";
import { TaskPriorityIcon } from "@/components/features/task/task-priority-icon";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface KanbanCardProps {
  task: Task;
  /** Rendered inside DragOverlay — disables click-to-open + skips sortable hooks. */
  isOverlay?: boolean;
  /** Disable sortable behavior (used when filters would make drag confusing). */
  dragDisabled?: boolean;
}

export function KanbanCard({ task, isOverlay, dragDisabled }: KanbanCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const sortable = useSortable({
    id: task.id,
    data: { type: "task", task },
    disabled: dragDisabled || isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  const subtaskDone = task.subtasks.filter((s) => s.completed).length;
  const subtaskTotal = task.subtasks.length;
  const isDone = task.status === "done";

  return (
    <>
      <article
        ref={isOverlay ? undefined : sortable.setNodeRef}
        style={isOverlay ? undefined : style}
        {...(isOverlay ? {} : sortable.attributes)}
        {...(isOverlay ? {} : sortable.listeners)}
        onClick={() => !isOverlay && !sortable.isDragging && setModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setModalOpen(true);
          }
        }}
        tabIndex={isOverlay ? -1 : 0}
        role="button"
        aria-label={`Mở task ${task.title}`}
        className={cn(
          "bg-card border-border/60 group rounded-lg border p-3 text-left transition-all",
          "hover:border-foreground/15 focus-visible:ring-ring hover:shadow-sm focus-visible:ring-2 focus-visible:outline-none",
          sortable.isDragging && "opacity-30",
          isOverlay && "rotate-2 cursor-grabbing shadow-xl",
          !dragDisabled && !isOverlay && "cursor-grab active:cursor-grabbing",
          isDone && "opacity-70",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "min-w-0 flex-1 text-sm font-medium",
              isDone && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </h3>
          <TaskPriorityIcon priority={task.priority} className="mt-0.5 shrink-0" />
        </div>

        {task.description && (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{task.description}</p>
        )}

        {task.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="bg-muted/60 text-muted-foreground rounded px-1.5 py-0.5 text-[10px]"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 4 && (
              <span className="text-muted-foreground text-[10px]">+{task.tags.length - 4}</span>
            )}
          </div>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
          {task.dueDate && <TaskDueBadge dueDate={task.dueDate} muted={isDone} />}
          {subtaskTotal > 0 && (
            <span
              className={cn(
                "text-muted-foreground inline-flex items-center gap-0.5",
                subtaskDone === subtaskTotal && "text-success",
              )}
              title={`${subtaskDone}/${subtaskTotal} subtasks hoàn thành`}
            >
              <ListChecks className="size-3" />
              {subtaskDone}/{subtaskTotal}
            </span>
          )}
        </div>
      </article>

      {!isOverlay && (
        <TaskModal mode="edit" task={task} open={modalOpen} onOpenChange={setModalOpen} />
      )}
    </>
  );
}
