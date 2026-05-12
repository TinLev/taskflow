"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Building2,
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  LogOut,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  Upload,
  UserIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { WorkspaceDeleteDialog } from "@/components/features/workspace/workspace-delete-dialog";
import { WorkspaceFormDialog } from "@/components/features/workspace/workspace-form-dialog";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useProjects } from "@/contexts/project-context";
import { useWorkspaces } from "@/contexts/workspace-context";
import {
  downloadDataExport,
  downloadTasksCSV,
  importDataFromJSON,
  readJSONFile,
} from "@/lib/data-export";
import { safeStorage } from "@/lib/storage";
import type { Workspace } from "@/types";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { workspaces } = useWorkspaces();
  const { getProjectsByWorkspace } = useProjects();
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [importConfirm, setImportConfirm] = useState<{ json: unknown } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleClearAllData() {
    safeStorage.clear("taskflow:");
    toast.success("Đã xóa toàn bộ dữ liệu local. Đang đăng xuất...");
    setTimeout(() => logout(), 500);
  }

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting same file later
    if (!file) return;
    try {
      const json = await readJSONFile(file);
      setImportConfirm({ json });
    } catch {
      toast.error("File không phải JSON hợp lệ");
    }
  }

  function handleConfirmImport() {
    if (!importConfirm) return;
    const result = importDataFromJSON(importConfirm.json);
    if (!result.ok) {
      toast.error(result.error);
      setImportConfirm(null);
      return;
    }
    toast.success(
      `Đã import: ${result.counts.workspaces} workspaces / ${result.counts.projects} projects / ${result.counts.tasks} tasks. Đang tải lại...`,
    );
    setImportConfirm(null);
    // Full reload is cleanest — every provider rehydrates from new storage.
    setTimeout(() => window.location.reload(), 800);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Cài đặt</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Quản lý tài khoản, workspaces và dữ liệu của bạn.
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account" className="gap-1.5">
            <UserIcon className="size-3.5" /> Tài khoản
          </TabsTrigger>
          <TabsTrigger value="workspaces" className="gap-1.5">
            <Building2 className="size-3.5" /> Workspaces
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-1.5">
            <Database className="size-3.5" /> Dữ liệu
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-1.5">
            <ShieldAlert className="size-3.5" /> Danger zone
          </TabsTrigger>
        </TabsList>

        {/* ─────────────── Account tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
              <CardDescription>
                Dữ liệu này chỉ lưu trong trình duyệt (localStorage). Trong production, sẽ đồng bộ
                với backend.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Tên" value={user?.name ?? "—"} />
              <Row label="Email" value={user?.email ?? "—"} />
              <Row
                label="Ngày tạo"
                value={
                  user?.createdAt
                    ? format(new Date(user.createdAt), "dd MMM yyyy", { locale: vi })
                    : "—"
                }
              />
              <Row label="User ID" value={user?.id ?? "—"} mono />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─────────────── Workspaces tab */}
        <TabsContent value="workspaces" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle>Workspaces của bạn</CardTitle>
                <CardDescription>{workspaces.length} workspace</CardDescription>
              </div>
              <Button onClick={() => setCreateWorkspaceOpen(true)} size="sm" className="gap-1.5">
                <Plus className="size-4" /> Tạo workspace
              </Button>
            </CardHeader>
            <CardContent>
              {workspaces.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  Chưa có workspace nào.
                </p>
              ) : (
                <ul className="divide-border/60 divide-y">
                  {workspaces.map((ws) => {
                    const projectCount = getProjectsByWorkspace(ws.id).length;
                    return (
                      <li
                        key={ws.id}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="bg-secondary inline-flex size-9 shrink-0 items-center justify-center rounded-md text-lg">
                            {ws.icon}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{ws.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {projectCount} project{projectCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditingWorkspace(ws)}
                            aria-label={`Sửa ${ws.name}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <WorkspaceDeleteDialog
                            workspace={ws}
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive hover:text-destructive"
                                aria-label={`Xóa ${ws.name}`}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            }
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─────────────── Data tab */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export dữ liệu</CardTitle>
              <CardDescription>
                Tải về snapshot toàn bộ workspaces / projects / tasks của trình duyệt này. Hữu ích
                cho backup, migration sang account khác, hoặc share dữ liệu mẫu.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button onClick={downloadDataExport} variant="outline" className="gap-1.5">
                <FileJson className="size-4" /> Tải JSON đầy đủ
              </Button>
              <Button onClick={downloadTasksCSV} variant="outline" className="gap-1.5">
                <FileSpreadsheet className="size-4" /> Tải tasks (CSV)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import từ JSON</CardTitle>
              <CardDescription>
                Khôi phục từ file đã export. <strong>Lưu ý:</strong> dữ liệu hiện tại sẽ bị ghi đè
                (không merge). Schema được validate qua zod trước khi áp dụng.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleFileChosen}
                className="sr-only"
                aria-label="Chọn file JSON"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="gap-1.5"
              >
                <Upload className="size-4" /> Chọn file...
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─────────────── Danger zone tab */}
        <TabsContent value="danger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Đăng xuất</CardTitle>
              <CardDescription>
                Dữ liệu của bạn vẫn được giữ lại — đăng nhập lại sẽ thấy đúng workspaces / projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={logout} variant="outline" className="gap-1.5">
                <LogOut className="size-4" /> Đăng xuất
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive">Xóa toàn bộ dữ liệu</CardTitle>
              <CardDescription>
                Xóa tất cả workspaces, projects, tasks của tất cả người dùng trong trình duyệt này.
                Không thể hoàn tác.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-1.5">
                    <Trash2 className="size-4" /> Xóa toàn bộ dữ liệu
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bạn chắc chắn muốn xóa?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Toàn bộ workspaces, projects, tasks và session của tất cả người dùng trong
                      trình duyệt này sẽ bị xóa. Bạn sẽ bị đăng xuất ngay.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAllData}
                      className="bg-destructive hover:bg-destructive/90 text-white"
                    >
                      Xóa và đăng xuất
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <WorkspaceFormDialog
        mode="create"
        open={createWorkspaceOpen}
        onOpenChange={setCreateWorkspaceOpen}
      />
      {editingWorkspace && (
        <WorkspaceFormDialog
          mode="edit"
          workspace={editingWorkspace}
          open={editingWorkspace !== null}
          onOpenChange={(open) => !open && setEditingWorkspace(null)}
        />
      )}

      <AlertDialog open={importConfirm !== null} onOpenChange={(o) => !o && setImportConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ghi đè dữ liệu hiện tại?</AlertDialogTitle>
            <AlertDialogDescription>
              File này sẽ thay thế toàn bộ workspaces / projects / tasks hiện tại trong trình duyệt.
              Hãy export backup trước nếu bạn cần dữ liệu cũ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>
              <Download className="mr-2 size-4 rotate-180" />
              Import & reload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
      <span className="text-muted-foreground w-28 shrink-0 text-xs tracking-wide uppercase">
        {label}
      </span>
      <Separator orientation="vertical" className="hidden h-4 sm:block" />
      <span className={mono ? "font-mono text-xs" : ""}>{value}</span>
    </div>
  );
}
