"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { SubtaskList } from "@/components/features/task/subtask-list";
import { TaskPriorityIcon } from "@/components/features/task/task-priority-icon";
import { TaskStatusBadge } from "@/components/features/task/task-status-badge";
import { TagInput } from "@/components/features/task/tag-input";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useTasks } from "@/contexts/task-context";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { TaskFormSchema, type TaskFormInput } from "@/lib/validations";
import type { Task, TaskPriority, TaskStatus } from "@/types";

interface TaskModalProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode: "create" | "edit";
  /** For create mode: which project to add the task into. */
  projectId?: string;
  /** Optional defaults for create (status from a column, dueDate from a calendar day). */
  defaults?: { status?: TaskStatus; priority?: TaskPriority; dueDate?: Date };
  /** For edit mode. */
  task?: Task;
}

export function TaskModal({
  trigger,
  open: controlledOpen,
  onOpenChange,
  mode,
  projectId,
  defaults,
  task,
}: TaskModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const { createTask, updateTask, deleteTask, addSubtask, toggleSubtask, deleteSubtask } =
    useTasks();

  const form = useForm<TaskFormInput>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: getInitialValues(task, defaults),
  });

  // Reset when re-opened or target changes.
  useEffect(() => {
    if (open) form.reset(getInitialValues(task, defaults));
  }, [open, task, defaults, form]);

  async function onSubmit(values: TaskFormInput) {
    if (mode === "create") {
      if (!projectId) {
        toast.error("Thiếu project — không thể tạo task.");
        return;
      }
      const created = createTask({
        projectId,
        title: values.title,
        ...(values.description ? { description: values.description } : {}),
        status: values.status,
        priority: values.priority,
        ...(values.dueDate ? { dueDate: values.dueDate } : {}),
        tags: values.tags ?? [],
        ...(values.assigneeId ? { assigneeId: values.assigneeId } : {}),
      });
      if (!created) {
        toast.error("Không thể tạo task. Vui lòng thử lại.");
        return;
      }
      toast.success(`Đã tạo "${created.title}"`);
    } else if (task) {
      updateTask(task.id, {
        title: values.title,
        ...(values.description ? { description: values.description } : { description: undefined }),
        status: values.status,
        priority: values.priority,
        ...(values.dueDate ? { dueDate: values.dueDate } : { dueDate: undefined }),
        tags: values.tags ?? [],
        ...(values.assigneeId ? { assigneeId: values.assigneeId } : { assigneeId: undefined }),
      });
      toast.success("Đã lưu thay đổi");
    }
    setOpen(false);
  }

  function handleDelete() {
    if (!task) return;
    deleteTask(task.id);
    toast.success(`Đã xóa "${task.title}"`);
    setOpen(false);
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tạo task mới" : "Chi tiết task"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Mọi field đều có thể sửa sau khi tạo."
              : "Thay đổi được lưu khi bạn nhấn “Lưu”. Subtasks lưu ngay khi tick."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="task-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mô tả ngắn task..."
                      autoFocus
                      autoComplete="off"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Chi tiết hơn (tùy chọn)..."
                      rows={3}
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_STATUSES.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            <TaskStatusBadge status={s.id} size="sm" />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_PRIORITIES.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <span className="inline-flex items-center gap-1.5">
                              <TaskPriorityIcon priority={p.id} />
                              {p.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        disabled={isSubmitting}
                      >
                        <CalendarIcon className="size-4" />
                        {field.value
                          ? format(new Date(field.value), "EEEE, dd MMMM yyyy", { locale: vi })
                          : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(d) => field.onChange(d)}
                      />
                      {field.value && (
                        <div className="border-border/60 border-t p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => field.onChange(undefined)}
                          >
                            Xóa due date
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Controller
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {/* Subtasks — only shown in edit mode, since they need a persisted task */}
        {mode === "edit" && task && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Subtasks</h3>
              <SubtaskList
                subtasks={task.subtasks}
                onAdd={(title) => addSubtask(task.id, title)}
                onToggle={(id) => toggleSubtask(task.id, id)}
                onDelete={(id) => deleteSubtask(task.id, id)}
              />
            </div>
          </>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {mode === "edit" && task && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive mr-auto gap-1.5"
                >
                  <Trash2 className="size-4" /> Xóa
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa task &ldquo;{task.title}&rdquo;?</AlertDialogTitle>
                  <AlertDialogDescription>Hành động không thể hoàn tác.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90 text-white"
                  >
                    Xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type="submit" form="task-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "create" ? "Tạo task" : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getInitialValues(task?: Task, defaults?: TaskModalProps["defaults"]): TaskFormInput {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? defaults?.status ?? "todo",
    priority: task?.priority ?? defaults?.priority ?? "medium",
    dueDate: task?.dueDate ? new Date(task.dueDate) : (defaults?.dueDate ?? undefined),
    tags: task?.tags ?? [],
    assigneeId: task?.assigneeId,
  };
}
