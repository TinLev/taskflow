"use client";

import { Inbox, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { BulkActionBar } from "@/components/features/list-view/bulk-action-bar";
import { TaskDueBadge } from "@/components/features/task/task-due-badge";
import { TaskFilters } from "@/components/features/task/task-filters";
import { TaskModal } from "@/components/features/task/task-modal";
import { TaskPriorityIcon } from "@/components/features/task/task-priority-icon";
import { TaskStatusBadge } from "@/components/features/task/task-status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTasks } from "@/contexts/task-context";
import { applyTaskFilters, useTaskFilters } from "@/hooks/use-task-filters";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskListViewProps {
  projectId: string;
}

export function TaskListView({ projectId }: TaskListViewProps) {
  const { getTasksByProject, deleteTask } = useTasks();
  const { filters } = useTaskFilters();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Selection state for bulk actions. Stored as a Set for O(1) lookups
  // and cleared whenever the visible task list changes (filters, project
  // switch) so the floating bar can't refer to off-screen tasks.
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const allTasks = useMemo(() => getTasksByProject(projectId), [getTasksByProject, projectId]);
  const tasks = useMemo(() => applyTaskFilters(allTasks, filters), [allTasks, filters]);

  // Drop selected IDs that are no longer visible. setState returns the
  // same Set reference when nothing changes, so React bails out of a
  // re-render — the lint warning about cascading renders doesn't apply
  // to this no-op-fast pattern.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing selection state to filtered task list
    setSelected((prev) => {
      if (prev.size === 0) return prev;
      const visibleIds = new Set(tasks.map((t) => t.id));
      const next = new Set([...prev].filter((id) => visibleIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [tasks]);

  const allSelected = tasks.length > 0 && tasks.every((t) => selected.has(t.id));
  const someSelected = !allSelected && tasks.some((t) => selected.has(t.id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      allSelected ? new Set() : new Set([...prev, ...tasks.map((t) => t.id)]),
    );
  }

  function handleDelete(task: Task) {
    deleteTask(task.id);
    toast.success(`Đã xóa "${task.title}"`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TaskFilters tasks={allTasks} />
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5">
          <Plus className="size-4" /> Task mới
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="border-border/60 bg-card/30 rounded-xl border border-dashed p-12 text-center">
          <div className="bg-secondary mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full">
            <Inbox className="text-muted-foreground size-6" />
          </div>
          <h3 className="font-semibold">
            {allTasks.length === 0 ? "Chưa có task nào" : "Không có task nào khớp filter"}
          </h3>
          <p className="text-muted-foreground mt-1 mb-4 text-sm">
            {allTasks.length === 0
              ? "Tạo task đầu tiên để bắt đầu."
              : "Thử xóa bớt filter hoặc đổi search."}
          </p>
          {allTasks.length === 0 && (
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus className="size-4" /> Tạo task mới
            </Button>
          )}
        </div>
      ) : (
        <div className="border-border/60 overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-border/60 text-muted-foreground border-b text-xs tracking-wide uppercase">
                <tr>
                  <th className="w-10 px-3 py-2.5">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={toggleAll}
                      aria-label="Chọn tất cả"
                    />
                  </th>
                  <th className="px-2 py-2.5 text-left font-medium">Title</th>
                  <th className="px-3 py-2.5 text-left font-medium">Status</th>
                  <th className="px-3 py-2.5 text-left font-medium">Priority</th>
                  <th className="px-3 py-2.5 text-left font-medium">Due</th>
                  <th className="px-3 py-2.5 text-left font-medium">Tags</th>
                  <th className="w-10 px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-border/40 divide-y">
                {tasks.map((task) => {
                  const isSelected = selected.has(task.id);
                  return (
                    <tr
                      key={task.id}
                      className={cn(
                        "hover:bg-muted/30 group cursor-pointer transition-colors",
                        isSelected && "bg-muted/30",
                      )}
                      onClick={() => setEditingTask(task)}
                      aria-selected={isSelected}
                    >
                      <td className="px-3 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(task.id)}
                          aria-label={`Chọn ${task.title}`}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "font-medium",
                              task.status === "done" && "text-muted-foreground line-through",
                            )}
                          >
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="text-muted-foreground line-clamp-1 text-xs">
                              {task.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <TaskStatusBadge status={task.status} size="sm" />
                      </td>
                      <td className="px-3 py-3">
                        <TaskPriorityIcon priority={task.priority} showLabel />
                      </td>
                      <td className="px-3 py-3">
                        {task.dueDate ? (
                          <TaskDueBadge dueDate={task.dueDate} muted={task.status === "done"} />
                        ) : (
                          <span className="text-muted-foreground/70 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {task.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="bg-muted/60 text-muted-foreground rounded px-1.5 py-0.5 text-[10px]"
                              >
                                {t}
                              </span>
                            ))}
                            {task.tags.length > 3 && (
                              <span className="text-muted-foreground text-[10px]">
                                +{task.tags.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/70 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                              aria-label="Tùy chọn task"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => setEditingTask(task)}>
                              <Pencil className="size-4" /> Sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="size-4" /> Xóa
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xóa task này?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    &ldquo;{task.title}&rdquo; sẽ bị xóa vĩnh viễn.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(task)}
                                    className="bg-destructive hover:bg-destructive/90 text-white"
                                  >
                                    Xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BulkActionBar selectedIds={[...selected]} onClear={() => setSelected(new Set())} />

      <TaskModal
        mode="create"
        projectId={projectId}
        open={createOpen}
        onOpenChange={setCreateOpen}
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
