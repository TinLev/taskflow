"use client";

import { ArrowLeft, FolderPlus, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ProjectCard } from "@/components/features/project/project-card";
import { ProjectFormDialog } from "@/components/features/project/project-form-dialog";
import { WorkspaceDeleteDialog } from "@/components/features/workspace/workspace-delete-dialog";
import { WorkspaceFormDialog } from "@/components/features/workspace/workspace-form-dialog";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects } from "@/contexts/project-context";
import { useWorkspaces } from "@/contexts/workspace-context";

export default function WorkspacePage() {
  const params = useParams<{ id: string }>();
  const workspaceId = params.id;

  const { workspaces, activeWorkspace, setActiveWorkspace, isLoading: wsLoading } = useWorkspaces();
  const { getProjectsByWorkspace, isLoading: projectsLoading } = useProjects();

  const [editOpen, setEditOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const workspace = useMemo(
    () => workspaces.find((w) => w.id === workspaceId),
    [workspaces, workspaceId],
  );

  // Sync URL → activeWorkspace. When the user navigates via a direct link
  // (not via the switcher), the context's active workspace should follow.
  useEffect(() => {
    if (!workspaceId) return;
    if (workspace && activeWorkspace?.id !== workspaceId) {
      setActiveWorkspace(workspaceId);
    }
  }, [workspaceId, workspace, activeWorkspace, setActiveWorkspace]);

  if (wsLoading || projectsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner label="Đang tải workspace..." />
      </div>
    );
  }

  if (!workspace) {
    // Either invalid ID or workspace belongs to a different user.
    notFound();
  }

  const projects = getProjectsByWorkspace(workspace.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Quay lại Tổng quan
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-secondary inline-flex size-12 shrink-0 items-center justify-center rounded-xl text-3xl">
              {workspace.icon}
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{workspace.name}</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {projects.length} project{projects.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setCreateProjectOpen(true)} className="gap-1.5">
              <Plus className="size-4" /> Project mới
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Tùy chọn workspace">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="size-4" /> Sửa workspace
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <WorkspaceDeleteDialog
                  workspace={workspace}
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-4" /> Xóa workspace
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Projects */}
      {projects.length === 0 ? (
        <div className="border-border/60 bg-card/30 rounded-xl border border-dashed p-12 text-center">
          <div className="bg-secondary mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full">
            <FolderPlus className="text-muted-foreground size-6" />
          </div>
          <h2 className="font-semibold">Chưa có project nào</h2>
          <p className="text-muted-foreground mt-1 mb-4 text-sm">
            Tạo project đầu tiên để bắt đầu quản lý tasks.
          </p>
          <Button onClick={() => setCreateProjectOpen(true)} className="gap-1.5">
            <Plus className="size-4" /> Tạo project mới
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              href={`/dashboard/workspace/${workspace.id}/project/${p.id}`}
            />
          ))}
        </div>
      )}

      <WorkspaceFormDialog
        mode="edit"
        workspace={workspace}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <ProjectFormDialog
        mode="create"
        workspaceId={workspace.id}
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />
    </div>
  );
}
