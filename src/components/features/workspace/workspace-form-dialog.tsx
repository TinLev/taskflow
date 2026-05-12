"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
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
import { useWorkspaces } from "@/contexts/workspace-context";
import { cn } from "@/lib/utils";
import { WorkspaceFormSchema, type WorkspaceFormInput } from "@/lib/validations";
import type { Workspace } from "@/types";

const WORKSPACE_ICON_PRESETS = [
  "🏠",
  "📚",
  "💼",
  "🚀",
  "⭐",
  "🎯",
  "💡",
  "📁",
  "✨",
  "🔥",
  "⚡",
  "🌟",
];

interface WorkspaceFormDialogProps {
  trigger?: ReactNode;
  /** Controlled open state — leave undefined for uncontrolled trigger-based usage. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: "create" | "edit";
  /** Required when mode="edit". */
  workspace?: Workspace;
  /** Called after successful create / edit with the resulting workspace. */
  onSuccess?: (workspace: Workspace) => void;
}

export function WorkspaceFormDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  mode = "create",
  workspace,
  onSuccess,
}: WorkspaceFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const { createWorkspace, updateWorkspace } = useWorkspaces();

  const form = useForm<WorkspaceFormInput>({
    resolver: zodResolver(WorkspaceFormSchema),
    defaultValues: { name: workspace?.name ?? "", icon: workspace?.icon ?? "🏠" },
  });

  // Reset form when toggling dialog / switching target workspace.
  useEffect(() => {
    if (open) {
      form.reset({ name: workspace?.name ?? "", icon: workspace?.icon ?? "🏠" });
    }
  }, [open, workspace, form]);

  async function onSubmit(values: WorkspaceFormInput) {
    if (mode === "create") {
      const created = createWorkspace(values);
      if (!created) {
        toast.error("Không thể tạo workspace. Vui lòng thử lại.");
        return;
      }
      toast.success(`Đã tạo workspace "${created.name}"`);
      onSuccess?.(created);
    } else if (workspace) {
      updateWorkspace(workspace.id, values);
      toast.success(`Đã cập nhật "${values.name}"`);
      onSuccess?.({ ...workspace, ...values });
    }
    setOpen(false);
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tạo workspace mới" : "Sửa workspace"}</DialogTitle>
          <DialogDescription>
            Workspace giúp bạn nhóm các projects liên quan (vd: Personal, Học tập).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="workspace-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biểu tượng</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <Input
                        maxLength={4}
                        className="w-24 text-center text-2xl"
                        disabled={isSubmitting}
                        {...field}
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {WORKSPACE_ICON_PRESETS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => field.onChange(emoji)}
                            className={cn(
                              "hover:bg-secondary inline-flex size-9 items-center justify-center rounded-md text-xl transition-colors",
                              field.value === emoji && "bg-secondary ring-ring ring-2",
                            )}
                            aria-label={`Chọn icon ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>Một emoji giúp nhận diện workspace nhanh.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên workspace</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="vd: Personal, Học tập, Freelance..."
                      autoComplete="off"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
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
          <Button type="submit" form="workspace-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "create" ? "Tạo workspace" : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
