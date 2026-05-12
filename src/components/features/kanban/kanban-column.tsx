"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useState } from "react";

import { KanbanCard } from "@/components/features/kanban/kanban-card";
import { TaskModal } from "@/components/features/task/task-modal";
import { Button } from "@/components/ui/button";
import { STATUS_BY_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";

interface KanbanColumnProps {
  status: TaskStatus;
  /** Tasks of this column AFTER user filtering — used for display + drag IDs. */
  tasks: Task[];
  projectId: string;
  dragDisabled?: boolean;
}

export function KanbanColumn({ status, tasks, projectId, dragDisabled }: KanbanColumnProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const config = STATUS_BY_ID[status];

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: "column", status },
  });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", config.dotClass)} aria-hidden />
          <h2 className="text-sm font-semibold">{config.label}</h2>
          <span className="text-muted-foreground text-xs">{tasks.length}</span>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setCreateOpen(true)}
          aria-label={`Tạo task ${config.label}`}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "bg-muted/30 border-border/60 flex min-h-[200px] flex-1 flex-col gap-2 rounded-lg border p-2 transition-colors",
          isOver && "border-ring/50 bg-muted/60",
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((t) => (
            <KanbanCard key={t.id} task={t} dragDisabled={dragDisabled} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="text-muted-foreground/70 flex flex-1 items-center justify-center py-6 text-xs">
            Kéo task vào đây
          </div>
        )}

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="text-muted-foreground hover:bg-secondary/60 hover:text-foreground mt-auto flex items-center justify-center gap-1 rounded-md py-1.5 text-xs transition-colors"
        >
          <Plus className="size-3.5" /> Thêm task
        </button>
      </div>

      <TaskModal
        mode="create"
        projectId={projectId}
        defaults={{ status }}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
