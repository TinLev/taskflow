"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

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
import { useProjects } from "@/contexts/project-context";
import { useWorkspaces } from "@/contexts/workspace-context";
import type { Workspace } from "@/types";

interface WorkspaceDeleteDialogProps {
  workspace: Workspace;
  trigger?: ReactNode;
  /** Where to redirect after deletion. Defaults to /dashboard. */
  redirectAfter?: string;
}

/**
 * WorkspaceDeleteDialog — confirmation modal that cascades to projects.
 *
 * Cascade order:
 *  1. Delete all projects under this workspace.
 *  2. Delete the workspace itself.
 *
 * This order matters: doing it the other way around would leave
 * `projects` with a workspaceId pointing to a deleted workspace,
 * causing the filter in ProjectContext to drop them anyway — but
 * being explicit keeps the code's intent obvious.
 */
export function WorkspaceDeleteDialog({
  workspace,
  trigger,
  redirectAfter = "/dashboard",
}: WorkspaceDeleteDialogProps) {
  const router = useRouter();
  const { deleteWorkspace } = useWorkspaces();
  const { getProjectsByWorkspace, deleteProjectsByWorkspace } = useProjects();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const projectCount = getProjectsByWorkspace(workspace.id).length;

  async function handleConfirm() {
    setDeleting(true);
    try {
      deleteProjectsByWorkspace(workspace.id);
      deleteWorkspace(workspace.id);
      toast.success(`Đã xóa workspace "${workspace.name}"`);
      setOpen(false);
      router.push(redirectAfter);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa workspace &ldquo;{workspace.name}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Tất cả{" "}
            <span className="text-foreground font-medium">{projectCount} project</span> và tasks
            trong workspace này sẽ bị xóa vĩnh viễn.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleting}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            {deleting && <Loader2 className="size-4 animate-spin" />}
            Xóa workspace
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
