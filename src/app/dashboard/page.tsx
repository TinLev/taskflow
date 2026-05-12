"use client";

import { Calendar, CheckCircle2, Inbox, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Chào, {user?.name ?? "bạn"} 👋
        </h1>
        <p className="text-muted-foreground mt-1.5">
          Đây là dashboard của bạn — Phase 4 sẽ thay placeholder bằng stats thực.
        </p>
      </div>

      {/* Stat placeholder cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Inbox} label="Tổng tasks" hint="—" tone="muted" />
        <StatCard icon={CheckCircle2} label="Đã hoàn thành" hint="—" tone="success" />
        <StatCard icon={Calendar} label="Hôm nay" hint="—" tone="info" />
        <StatCard icon={Sparkles} label="Quá hạn" hint="—" tone="warning" />
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="text-brand size-5" />
            Coming next — Phase 3
          </CardTitle>
          <CardDescription>
            Workspace & Project Context. Bạn sẽ tạo được workspace, project và điều hướng giữa chúng
            qua sidebar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground space-y-1.5 text-sm">
            <li>• WorkspaceContext + ProjectContext (useReducer)</li>
            <li>• CRUD workspace/project với optimistic updates</li>
            <li>• Sidebar workspace switcher + project tree</li>
            <li>• Settings page</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────────────────────────── Sub-components */

interface StatCardProps {
  icon: typeof Inbox;
  label: string;
  hint: string;
  tone: "muted" | "success" | "info" | "warning";
}

const TONE_CLASSES: Record<StatCardProps["tone"], string> = {
  muted: "bg-muted text-muted-foreground",
  success: "bg-success/15 text-success",
  info: "bg-info/15 text-info",
  warning: "bg-warning/15 text-warning",
};

function StatCard({ icon: Icon, label, hint, tone }: StatCardProps) {
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
          </p>
          <p className="mt-0.5 text-2xl font-semibold">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
