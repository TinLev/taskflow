"use client";

import { isToday, isPast, isThisWeek } from "date-fns";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  FolderOpen,
  Inbox,
  Plus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { TaskDueBadge } from "@/components/features/task/task-due-badge";
import { TaskModal } from "@/components/features/task/task-modal";
import { TaskPriorityIcon } from "@/components/features/task/task-priority-icon";
import { TaskStatusBadge } from "@/components/features/task/task-status-badge";
import { WorkspaceFormDialog } from "@/components/features/workspace/workspace-form-dialog";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useProjects } from "@/contexts/project-context";
import { useTasks } from "@/contexts/task-context";
import { useWorkspaces } from "@/contexts/workspace-context";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { workspaces, isLoading: wsLoading } = useWorkspaces();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { tasks, isLoading: tasksLoading } = useTasks();

  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const today = tasks.filter(
      (t) => t.dueDate && isToday(new Date(t.dueDate)) && t.status !== "done",
    ).length;
    const overdue = tasks.filter(
      (t) =>
        t.dueDate &&
        isPast(new Date(t.dueDate)) &&
        !isToday(new Date(t.dueDate)) &&
        t.status !== "done",
    ).length;
    return { total, done, today, overdue };
  }, [tasks]);

  const completionPct = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);

  // Active / due-soon tasks across all projects
  const dueSoon = useMemo(
    () =>
      tasks
        .filter((t) => t.dueDate && t.status !== "done" && isThisWeek(new Date(t.dueDate)))
        .sort(
          (a, b) => new Date(a.dueDate as Date).getTime() - new Date(b.dueDate as Date).getTime(),
        )
        .slice(0, 8),
    [tasks],
  );

  const projectsById = useMemo(() => new Map(projects.map((p) => [p.id, p] as const)), [projects]);
  const workspacesById = useMemo(
    () => new Map(workspaces.map((w) => [w.id, w] as const)),
    [workspaces],
  );

  if (wsLoading || projectsLoading || tasksLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner label="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Chào, {user?.name ?? "bạn"} 👋
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Tổng quan workspaces, projects và tasks của bạn.
          </p>
        </div>
        <Button onClick={() => setCreateWorkspaceOpen(true)} className="gap-1.5">
          <Plus className="size-4" /> Tạo workspace
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Building2} label="Workspaces" value={workspaces.length} tone="brand" />
        <StatCard icon={FolderOpen} label="Projects" value={projects.length} tone="info" />
        <StatCard icon={Inbox} label="Tasks" value={stats.total} tone="muted" />
        <StatCard
          icon={CheckCircle2}
          label="Hoàn thành"
          value={`${stats.done}`}
          hint={stats.total ? `${completionPct}%` : undefined}
          tone="success"
        />
        <StatCard icon={CalendarClock} label="Hôm nay" value={stats.today} tone="warning" />
        <StatCard icon={AlertTriangle} label="Quá hạn" value={stats.overdue} tone="destructive" />
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <Card>
          <CardContent className="space-y-2 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Tiến độ tổng thể</span>
              <span className="text-muted-foreground">
                {stats.done}/{stats.total} tasks
              </span>
            </div>
            <div className="bg-secondary h-2 overflow-hidden rounded-full">
              <div
                className="bg-success h-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Workspaces grid */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Workspaces của bạn</h2>
          {workspaces.length === 0 ? (
            <div className="border-border/60 bg-card/30 rounded-xl border border-dashed p-12 text-center">
              <div className="bg-secondary mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full">
                <Building2 className="text-muted-foreground size-6" />
              </div>
              <h3 className="font-semibold">Chưa có workspace nào</h3>
              <p className="text-muted-foreground mt-1 mb-4 text-sm">
                Tạo workspace đầu tiên để bắt đầu nhóm các projects.
              </p>
              <Button onClick={() => setCreateWorkspaceOpen(true)} className="gap-1.5">
                <Plus className="size-4" /> Tạo workspace
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {workspaces.map((ws) => {
                const wsProjects = projects.filter((p) => p.workspaceId === ws.id);
                const wsTasks = tasks.filter((t) => wsProjects.some((p) => p.id === t.projectId));
                const wsDone = wsTasks.filter((t) => t.status === "done").length;
                return (
                  <Link
                    key={ws.id}
                    href={`/dashboard/workspace/${ws.id}`}
                    className="bg-card border-border/60 hover:border-foreground/15 group block rounded-xl border p-5 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <span className="bg-secondary inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-2xl">
                        {ws.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold">{ws.name}</h3>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {wsProjects.length} project · {wsTasks.length} task
                          {wsTasks.length > 0 && ` · ${wsDone} done`}
                        </p>
                      </div>
                    </div>
                    {wsProjects.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {wsProjects.slice(0, 5).map((p) => (
                          <span
                            key={p.id}
                            className="bg-muted/60 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs"
                          >
                            <span
                              className="size-1.5 rounded-full"
                              style={{ backgroundColor: p.color }}
                            />
                            {p.icon} <span className="max-w-[80px] truncate">{p.name}</span>
                          </span>
                        ))}
                        {wsProjects.length > 5 && (
                          <span className="text-muted-foreground text-xs">
                            +{wsProjects.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Due soon sidebar */}
        <div>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Sắp đến hạn</h2>
          {dueSoon.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground p-6 text-center text-sm">
                Không có task nào sắp đến hạn trong tuần này 🎉
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {dueSoon.map((task) => {
                const project = projectsById.get(task.projectId);
                const workspace = project ? workspacesById.get(project.workspaceId) : undefined;
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setEditingTask(task)}
                    className="bg-card border-border/60 hover:border-foreground/15 flex w-full items-start gap-2 rounded-lg border p-3 text-left transition-colors"
                  >
                    <TaskPriorityIcon priority={task.priority} className="mt-1 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={cn("min-w-0 truncate text-sm font-medium")}>{task.title}</h3>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <TaskStatusBadge status={task.status} size="sm" />
                        {task.dueDate && <TaskDueBadge dueDate={task.dueDate} />}
                      </div>
                      {workspace && project && (
                        <p className="text-muted-foreground mt-1 truncate text-[11px]">
                          {workspace.icon} {workspace.name} / {project.icon} {project.name}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="text-brand size-5" />
            Coming next — Phase 5
          </CardTitle>
          <CardDescription>
            Polish — Command palette, keyboard shortcuts, animations, accessibility audit, README.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground space-y-1.5 text-sm">
            <li>• Command palette (⌘K) — quick navigation & action search</li>
            <li>• Global keyboard shortcuts (⌘N task, ⌘/ help, Esc close)</li>
            <li>• Bulk select + bulk actions trên List view</li>
            <li>• Export/import JSON, accessibility audit (WCAG AA+)</li>
            <li>• README.md song ngữ + deploy Vercel + demo video</li>
          </ul>
        </CardContent>
      </Card>

      <WorkspaceFormDialog
        mode="create"
        open={createWorkspaceOpen}
        onOpenChange={setCreateWorkspaceOpen}
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

/* ─────────────── Sub-components */

interface StatCardProps {
  icon: typeof Inbox;
  label: string;
  value: number | string;
  tone: "brand" | "success" | "info" | "muted" | "warning" | "destructive";
  hint?: string;
}

const TONE_CLASSES: Record<StatCardProps["tone"], string> = {
  brand: "bg-brand/15 text-brand",
  success: "bg-success/15 text-success",
  info: "bg-info/15 text-info",
  muted: "bg-muted text-muted-foreground",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
};

function StatCard({ icon: Icon, label, value, tone, hint }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
            {label}
          </p>
          <p className="mt-0.5 text-xl leading-tight font-semibold">
            {value}
            {hint && (
              <span className="text-muted-foreground/80 ml-1.5 text-xs font-normal">({hint})</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
