"use client";

import {
  ArrowLeft,
  Calendar,
  KanbanSquare,
  List,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams, usePathname, useRouter } from "next/navigation";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects } from "@/contexts/project-context";
import { useTasks } from "@/contexts/task-context";
import { useWorkspaces } from "@/contexts/workspace-context";
import { cn } from "@/lib/utils";

/**
 * Project layout — shared header (project info + view tabs) for
 * Kanban / List / Calendar pages. Each child page renders just the
 * view contents; the shell stays put across tab navigation.
 */
export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams<{ id: string; projectId: string }>();
  const pathname = usePathname();
  const workspaceId = params.id;
  const projectId = params.projectId;

  const { workspaces, activeWorkspace, setActiveWorkspace, isLoading: wsLoading } = useWorkspaces();
  const { getProject, deleteProject, isLoading: projectsLoading } = useProjects();
  const { deleteTasksByProject } = useTasks();

  const [editOpen, setEditOpen] = useState(false);

  const workspace = useMemo(
    () => workspaces.find((w) => w.id === workspaceId),
    [workspaces, workspaceId],
  );
  const project = useMemo(() => getProject(projectId), [getProject, projectId]);

  // Sync URL → active workspace
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
    // Cascade: tasks first, then the project itself.
    deleteTasksByProject(project.id);
    deleteProject(project.id);
    toast.success(`Đã xóa "${project.name}"`);
    router.push(`/dashboard/workspace/${workspaceId}`);
  }

  const basePath = `/dashboard/workspace/${workspace.id}/project/${project.id}`;
  const tabs = [
    { href: basePath, label: "Kanban", icon: KanbanSquare },
    { href: `${basePath}/list`, label: "List", icon: List },
    { href: `${basePath}/calendar`, label: "Calendar", icon: Calendar },
  ];

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
          <div className="flex min-w-0 items-center gap-3">
            <span className="bg-secondary inline-flex size-14 shrink-0 items-center justify-center rounded-xl text-3xl">
              {project.icon}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-muted-foreground mt-1 max-w-xl text-sm">{project.description}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <MoreHorizontal className="size-4" />
                Tùy chọn
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" /> Sửa project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" /> Xóa project
                  </DropdownMenuItem>
                </AlertDialogTrigger>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* View tabs */}
      <div className="border-border/60 flex gap-1 border-b">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* View body */}
      <div>{children}</div>

      <ProjectFormDialog mode="edit" project={project} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
