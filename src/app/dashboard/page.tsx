"use client";

import { Building2, FolderOpen, Inbox, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { WorkspaceFormDialog } from "@/components/features/workspace/workspace-form-dialog";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useProjects } from "@/contexts/project-context";
import { useWorkspaces } from "@/contexts/workspace-context";

export default function DashboardPage() {
  const { user } = useAuth();
  const { workspaces, isLoading: wsLoading } = useWorkspaces();
  const { projects, isLoading: projectsLoading } = useProjects();
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);

  if (wsLoading || projectsLoading) {
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
            Tổng quan workspaces và projects của bạn.
          </p>
        </div>
        <Button onClick={() => setCreateWorkspaceOpen(true)} className="gap-1.5">
          <Plus className="size-4" /> Tạo workspace
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Building2} label="Workspaces" value={workspaces.length} tone="brand" />
        <StatCard icon={FolderOpen} label="Projects" value={projects.length} tone="success" />
        <StatCard icon={Inbox} label="Tasks" value="—" tone="info" hint="Phase 4" />
      </div>

      {/* Workspaces grid */}
      <div>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws) => {
              const wsProjects = projects.filter((p) => p.workspaceId === ws.id);
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
                        {wsProjects.length} project{wsProjects.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  {wsProjects.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
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
                          +{wsProjects.length - 5} khác
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

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="text-brand size-5" />
            Coming next — Phase 4
          </CardTitle>
          <CardDescription>
            Task Management đầy đủ với Kanban drag-and-drop, List view, Calendar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground space-y-1.5 text-sm">
            <li>• TaskContext + useReducer + Task CRUD</li>
            <li>• Kanban board với @dnd-kit (drag tasks giữa status columns)</li>
            <li>• List view với sort/filter + URL query params</li>
            <li>• Calendar view theo due dates</li>
            <li>• Search global + filter compound + multi-select bulk actions</li>
          </ul>
        </CardContent>
      </Card>

      <WorkspaceFormDialog
        mode="create"
        open={createWorkspaceOpen}
        onOpenChange={setCreateWorkspaceOpen}
      />
    </div>
  );
}

/* ─────────────── Sub-components */

interface StatCardProps {
  icon: typeof Inbox;
  label: string;
  value: number | string;
  tone: "brand" | "success" | "info";
  hint?: string;
}

const TONE_CLASSES: Record<StatCardProps["tone"], string> = {
  brand: "bg-brand/15 text-brand",
  success: "bg-success/15 text-success",
  info: "bg-info/15 text-info",
};

function StatCard({ icon: Icon, label, value, tone, hint }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}
        >
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {label}
            {hint && <span className="text-muted-foreground/70 ml-1.5 normal-case">({hint})</span>}
          </p>
          <p className="mt-0.5 text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
