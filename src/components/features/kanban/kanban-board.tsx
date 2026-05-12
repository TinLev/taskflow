"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Info } from "lucide-react";
import { useMemo, useState } from "react";

import { KanbanCard } from "@/components/features/kanban/kanban-card";
import { KanbanColumn } from "@/components/features/kanban/kanban-column";
import { TaskFilters } from "@/components/features/task/task-filters";
import { useTasks } from "@/contexts/task-context";
import { useTaskFilters, applyTaskFilters } from "@/hooks/use-task-filters";
import { TASK_STATUSES } from "@/lib/constants";
import type { Task, TaskStatus } from "@/types";

interface KanbanBoardProps {
  projectId: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { getTasksByProject, reorderColumn } = useTasks();
  const { filters, activeCount } = useTaskFilters();

  const allTasks = useMemo(() => getTasksByProject(projectId), [getTasksByProject, projectId]);

  // Drag is disabled while filters are active — reordering filtered lists
  // produces confusing results when hidden tasks coexist in the column.
  const dragDisabled = activeCount > 0;

  // Visible tasks per column (with sort order intact — Kanban ignores
  // the sort filter; columns always show by `order`).
  const filteredTasks = useMemo(() => {
    // Apply filters but keep Kanban's native column ordering.
    const filtered = applyTaskFilters(allTasks, { ...filters, sort: "created" });
    return filtered.sort((a, b) => a.order - b.order);
  }, [allTasks, filters]);

  const tasksByStatus = useMemo(() => {
    const map = new Map<TaskStatus, Task[]>();
    for (const s of TASK_STATUSES) map.set(s.id, []);
    for (const t of filteredTasks) map.get(t.status)?.push(t);
    return map;
  }, [filteredTasks]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTask = useMemo(
    () => (activeId ? (allTasks.find((t) => t.id === activeId) ?? null) : null),
    [activeId, allTasks],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const draggedId = active.id as string;
    const dragged = allTasks.find((t) => t.id === draggedId);
    if (!dragged) return;

    // Determine destination status from the drop target.
    const overData = over.data.current as { type?: string; status?: TaskStatus } | undefined;
    let destStatus: TaskStatus;
    if (overData?.type === "column" && overData.status) {
      destStatus = overData.status;
    } else {
      const overTask = allTasks.find((t) => t.id === over.id);
      if (!overTask) return;
      destStatus = overTask.status;
    }

    // Operate on FULL task lists (not filtered) so renumbering stays
    // consistent across the column even when filters hide cards.
    const sourceColumn = allTasks
      .filter((t) => t.status === dragged.status && t.id !== draggedId)
      .sort((a, b) => a.order - b.order);

    const destColumn = allTasks
      .filter((t) => t.status === destStatus && t.id !== draggedId)
      .sort((a, b) => a.order - b.order);

    // Compute insert position.
    let insertAt: number;
    if (overData?.type === "column") {
      insertAt = destColumn.length; // dropped on column body → append
    } else {
      const overIndex = destColumn.findIndex((t) => t.id === over.id);
      insertAt = overIndex >= 0 ? overIndex : destColumn.length;
    }

    const newDestIds = [
      ...destColumn.slice(0, insertAt).map((t) => t.id),
      draggedId,
      ...destColumn.slice(insertAt).map((t) => t.id),
    ];

    // No-op shortcut: same column, same position.
    if (
      dragged.status === destStatus &&
      newDestIds.findIndex((id) => id === draggedId) ===
        allTasks
          .filter((t) => t.status === destStatus)
          .sort((a, b) => a.order - b.order)
          .findIndex((t) => t.id === draggedId)
    ) {
      return;
    }

    if (dragged.status !== destStatus) {
      // Renumber source column without the dragged task.
      reorderColumn(
        projectId,
        dragged.status,
        sourceColumn.map((t) => t.id),
      );
    }
    reorderColumn(projectId, destStatus, newDestIds);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <div className="space-y-4">
      <TaskFilters tasks={allTasks} hideSort />

      {dragDisabled && (
        <div className="border-info/30 bg-info/10 text-info flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
          <Info className="size-3.5 shrink-0" />
          Bộ lọc đang bật — kéo thả tạm tắt để tránh sắp xếp lệch. Bỏ filter để bật lại.
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-3">
          {TASK_STATUSES.map((s) => (
            <KanbanColumn
              key={s.id}
              status={s.id}
              tasks={tasksByStatus.get(s.id) ?? []}
              projectId={projectId}
              dragDisabled={dragDisabled}
            />
          ))}
        </div>

        <DragOverlay>{activeTask && <KanbanCard task={activeTask} isOverlay />}</DragOverlay>
      </DndContext>
    </div>
  );
}
