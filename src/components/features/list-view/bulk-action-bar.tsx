"use client";

import { ChevronDown, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTasks } from "@/contexts/task-context";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";

interface BulkActionBarProps {
  selectedIds: string[];
  onClear: () => void;
}

/**
 * Floating action bar shown when one or more rows are selected in the
 * List view. Sticks to the bottom of the viewport with a backdrop blur
 * so it doesn't fight the underlying table for attention.
 */
export function BulkActionBar({ selectedIds, onClear }: BulkActionBarProps) {
  const { bulkUpdate, bulkDelete } = useTasks();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const count = selectedIds.length;

  function handleStatus(status: (typeof TASK_STATUSES)[number]["id"]) {
    bulkUpdate(selectedIds, { status });
    toast.success(`Đã cập nhật ${count} task → ${status}`);
  }

  function handlePriority(priority: (typeof TASK_PRIORITIES)[number]["id"]) {
    bulkUpdate(selectedIds, { priority });
    toast.success(`Đã cập nhật ${count} task → ${priority}`);
  }

  function handleDelete() {
    bulkDelete(selectedIds);
    toast.success(`Đã xóa ${count} task`);
    onClear();
    setConfirmOpen(false);
  }

  if (count === 0) return null;

  return (
    <>
      <div
        role="region"
        aria-label="Bulk actions"
        className="bg-background/95 border-border fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border px-3 py-2 shadow-xl backdrop-blur"
      >
        <span className="text-sm">
          <span className="font-semibold">{count}</span> selected
        </span>

        <span className="bg-border h-5 w-px" aria-hidden />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              Status <ChevronDown className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel>Đổi status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {TASK_STATUSES.map((s) => (
              <DropdownMenuItem key={s.id} onClick={() => handleStatus(s.id)}>
                <TaskStatusBadge status={s.id} size="sm" />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              Priority <ChevronDown className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel>Đổi priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {TASK_PRIORITIES.map((p) => (
              <DropdownMenuItem key={p.id} onClick={() => handlePriority(p.id)}>
                <span className="inline-flex items-center gap-1.5">
                  <TaskPriorityIcon priority={p.id} />
                  {p.label}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirmOpen(true)}
          className="text-destructive hover:text-destructive gap-1"
        >
          <Trash2 className="size-3.5" /> Xóa
        </Button>

        <span className="bg-border h-5 w-px" aria-hidden />

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClear}
          aria-label="Bỏ chọn"
          className="text-muted-foreground"
        >
          <X className="size-4" />
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa {count} task?</AlertDialogTitle>
            <AlertDialogDescription>Hành động không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Xóa {count} task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
