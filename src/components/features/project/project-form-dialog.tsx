"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/contexts/project-context";
import { PROJECT_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ProjectFormSchema, type ProjectFormInput } from "@/lib/validations";
import type { Project } from "@/types";

const PROJECT_ICON_PRESETS = [
  "📁",
  "🚀",
  "💼",
  "📚",
  "🎨",
  "🏗️",
  "🧪",
  "⚡",
  "🔥",
  "✨",
  "🎯",
  "💡",
];

interface ProjectFormDialogProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: "create" | "edit";
  /** Required when mode="create". Sets which workspace receives the new project. */
  workspaceId?: string;
  /** Required when mode="edit". */
  project?: Project;
  onSuccess?: (project: Project) => void;
}

export function ProjectFormDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  mode = "create",
  workspaceId,
  project,
  onSuccess,
}: ProjectFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const { createProject, updateProject } = useProjects();

  const defaultColor = PROJECT_COLORS[0] ?? "#6366f1";
  const form = useForm<ProjectFormInput>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      color: project?.color ?? defaultColor,
      icon: project?.icon ?? "📁",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: project?.name ?? "",
        description: project?.description ?? "",
        color: project?.color ?? defaultColor,
        icon: project?.icon ?? "📁",
      });
    }
  }, [open, project, form, defaultColor]);

  // useWatch is the canonical reactive subscription — React Compiler can
  // memoize around it; `form.watch()` cannot be safely memoized.
  const watchedIcon = useWatch({ control: form.control, name: "icon" });

  async function onSubmit(values: ProjectFormInput) {
    if (mode === "create") {
      if (!workspaceId) {
        toast.error("Thiếu workspace để tạo project.");
        return;
      }
      const created = createProject({ ...values, workspaceId });
      if (!created) {
        toast.error("Không thể tạo project. Vui lòng thử lại.");
        return;
      }
      toast.success(`Đã tạo project "${created.name}"`);
      onSuccess?.(created);
    } else if (project) {
      updateProject(project.id, values);
      toast.success(`Đã cập nhật "${values.name}"`);
      onSuccess?.({ ...project, ...values });
    }
    setOpen(false);
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tạo project mới" : "Sửa project"}</DialogTitle>
          <DialogDescription>
            Project là nơi chứa các tasks liên quan tới một mục tiêu cụ thể.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="project-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-3">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem className="shrink-0">
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input
                        maxLength={4}
                        className="w-20 text-center text-2xl"
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
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Tên project</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="vd: Portfolio, Học React..."
                        autoComplete="off"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PROJECT_ICON_PRESETS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => form.setValue("icon", emoji)}
                  className={cn(
                    "hover:bg-secondary inline-flex size-9 items-center justify-center rounded-md text-xl transition-colors",
                    watchedIcon === emoji && "bg-secondary ring-ring ring-2",
                  )}
                  aria-label={`Chọn icon ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả (tùy chọn)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ngắn gọn về mục tiêu project..."
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Màu</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => field.onChange(c)}
                          className={cn(
                            "size-7 rounded-full transition-transform hover:scale-110",
                            field.value === c && "ring-ring scale-110 ring-2 ring-offset-2",
                          )}
                          style={{ backgroundColor: c }}
                          aria-label={`Chọn màu ${c}`}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>Màu này hiện ở sidebar và project card.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type="submit" form="project-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "create" ? "Tạo project" : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
