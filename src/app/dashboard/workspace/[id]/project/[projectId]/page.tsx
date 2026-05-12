"use client";

import { ArrowLeft, Calendar, KanbanSquare, List, Pencil, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ProjectFormDialog } from "@/components/features/project/project-form-dialog";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects } from "@/contexts/project-context";
import { useWorkspaces } from "@/contexts/workspace-context";

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string; projectId: string }>();
  const workspaceId = params.id;
  const projectId = params.projectId;

  const { workspaces, setActiveWorkspace, activeWorkspace, isLoading: wsLoading } = useWorkspaces();
  const { getProject, deleteProject, isLoading: projectsLoading } = useProjects();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const workspace = useMemo(
    () => workspaces.find((w) => w.id === workspaceId),
    [workspaces, workspaceId],
  );
  const project = useMemo(() => getProject(projectId), [getProject, projectId]);

  useEffect(() => {
    if (workspace && activeWorkspace?.id !== workspace.id) {
      setActiveWorkspace(workspace.id);
    }
  }, [workspace, activeWorkspace, setActiveWorkspace]);

  if (wsLoading || projectsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner label="Đang tải project..." />
      </div>
    );
  }

  if (!workspace || !project || project.workspaceId !== workspace.id) {
    notFound();
  }

  function handleDelete() {
    if (!project) return;
    deleteProject(project.id);
    toast.success(`Đã xóa "${project.name}"`);
    router.push(`/dashboard/workspace/${workspaceId}`);
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
        <Link
          href={`/dashboard/workspace/${workspace.id}`}
          className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          {workspace.icon} {workspace.name}
        </Link>
      </div>

      {/* Project header */}
      <div className="border-border/60 bg-card/30 relative overflow-hidden rounded-xl border p-6">
        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ backgroundColor: project.color }}
          aria-hidden
        />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-secondary inline-flex size-14 shrink-0 items-center justify-center rounded-xl text-3xl">
              {project.icon}
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{project.name}</h1>
              {project.description && (
                <p className="text-muted-foreground mt-1 max-w-xl text-sm">{project.description}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="size-3.5" />
                Tùy chọn
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" /> Sửa project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" /> Xóa project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* View tabs preview (Phase 4 wires real views) */}
      <div className="flex flex-wrap gap-2">
        <Button variant="default" size="sm" className="gap-1.5">
          <KanbanSquare className="size-4" /> Kanban
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5" disabled>
          <List className="size-4" /> List
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5" disabled>
          <Calendar className="size-4" /> Calendar
        </Button>
      </div>

      {/* Phase 4 placeholder */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="text-brand size-5" />
            Coming next — Phase 4
          </CardTitle>
          <CardDescription>
            Task Management với 3 views (Kanban, List, Calendar) + drag-and-drop + filter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground space-y-1.5 text-sm">
            <li>• TaskContext với useReducer (CRUD đầy đủ)</li>
            <li>• Kanban board với @dnd-kit drag-and-drop</li>
            <li>• List view với sort/filter + URL query params</li>
            <li>• Calendar view theo due dates</li>
            <li>• Task modal với subtasks, tags, priority, assignee</li>
            <li>• Search global + filter compound</li>
          </ul>
        </CardContent>
      </Card>

      <ProjectFormDialog mode="edit" project={project} open={editOpen} onOpenChange={setEditOpen} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa project &ldquo;{project.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Tất cả tasks trong project này cũng sẽ bị xóa. Hành động không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Xóa project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
