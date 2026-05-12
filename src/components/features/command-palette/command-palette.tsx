"use client";

import {
  Building2,
  CalendarDays,
  Download,
  FolderOpen,
  KanbanSquare,
  KeyRound,
  LayoutDashboard,
  List,
  LogOut,
  Monitor,
  Moon,
  Plus,
  Settings,
  Sun,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { ShortcutsHelpDialog } from "@/components/shared/shortcuts-help-dialog";
import { TaskModal } from "@/components/features/task/task-modal";
import { WorkspaceFormDialog } from "@/components/features/workspace/workspace-form-dialog";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useAuth } from "@/contexts/auth-context";
import { useProjects } from "@/contexts/project-context";
import { useWorkspaces } from "@/contexts/workspace-context";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { SHORTCUTS } from "@/lib/shortcuts";
import { downloadDataExport } from "@/lib/data-export";

/**
 * CommandPalette — global ⌘K launcher (Linear-style).
 *
 * Single component owns: open state, global shortcuts (⌘K, ⌘N, ⌘/),
 * and the inline modals it can spawn (TaskModal, WorkspaceFormDialog,
 * ShortcutsHelpDialog). Mounted once in the dashboard layout so it
 * picks up every context (workspaces, projects, auth, theme).
 *
 * Action selection pattern: each <CommandItem onSelect> closes the
 * palette first, then schedules the next UI on a microtask so the
 * Dialog dismount animation can finish before a sibling Dialog mounts
 * (Radix doesn't love overlapping dialogs).
 */
export function CommandPalette() {
  const router = useRouter();
  const { logout } = useAuth();
  const { workspaces } = useWorkspaces();
  const { projects } = useProjects();
  const { setTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [taskProjectId, setTaskProjectId] = useState<string | null>(null);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);

  // Global shortcuts
  useKeyboardShortcut(SHORTCUTS.COMMAND_PALETTE.combo, () => {
    setInitialQuery("");
    setOpen((o) => !o);
  });

  useKeyboardShortcut(SHORTCUTS.NEW_TASK.combo, () => {
    setInitialQuery("task");
    setOpen(true);
  });

  useKeyboardShortcut(SHORTCUTS.HELP.combo, () => {
    setHelpOpen(true);
  });

  // Reset query when palette closes so the next open starts fresh.
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot reset tied to the dialog close transition
      setInitialQuery("");
    }
  }, [open]);

  // Programmatic open via window event — header's search button uses this
  // so we don't have to lift palette state into a context.
  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<{ query?: string }>).detail;
      if (detail?.query) setInitialQuery(detail.query);
      setOpen(true);
    }
    window.addEventListener("taskflow:open-palette", handler);
    return () => window.removeEventListener("taskflow:open-palette", handler);
  }, []);

  /**
   * Run an action after closing the palette. Deferred via setTimeout so
   * Radix has time to remove the Dialog's overlay & focus trap before
   * any follow-up dialog mounts.
   */
  function runAction(fn: () => void) {
    setOpen(false);
    setTimeout(fn, 50);
  }

  function navigateTo(href: string) {
    runAction(() => router.push(href));
  }

  function handleExport() {
    runAction(() => {
      downloadDataExport();
    });
  }

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Command Palette"
        description="Tìm và thực thi mọi action — gõ để filter."
      >
        <CommandInput
          placeholder="Search projects, actions, settings..."
          defaultValue={initialQuery}
          // CommandInput is uncontrolled; defaultValue + remount via `key`
          // re-applies the prefill on every open.
          key={initialQuery + (open ? "1" : "0")}
        />
        <CommandList>
          <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>

          {/* ─────────────── Navigation */}
          <CommandGroup heading="Điều hướng">
            <CommandItem onSelect={() => navigateTo("/dashboard")}>
              <LayoutDashboard /> Tổng quan
            </CommandItem>
            <CommandItem onSelect={() => navigateTo("/dashboard/settings")}>
              <Settings /> Cài đặt
            </CommandItem>

            {workspaces.map((ws) => (
              <CommandItem
                key={ws.id}
                value={`workspace ${ws.name}`}
                onSelect={() => navigateTo(`/dashboard/workspace/${ws.id}`)}
              >
                <Building2 /> Workspace: {ws.icon} {ws.name}
              </CommandItem>
            ))}

            {projects.map((p) => {
              const ws = workspaces.find((w) => w.id === p.workspaceId);
              return (
                <CommandItem
                  key={p.id}
                  value={`project ${p.name} kanban`}
                  onSelect={() =>
                    navigateTo(`/dashboard/workspace/${p.workspaceId}/project/${p.id}`)
                  }
                >
                  <FolderOpen /> Project: {p.icon} {p.name}
                  {ws && (
                    <CommandShortcut className="text-[10px] opacity-60">
                      {ws.icon} {ws.name}
                    </CommandShortcut>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          {/* ─────────────── Actions */}
          <CommandGroup heading="Tạo mới">
            <CommandItem
              value="task workspace new"
              onSelect={() => runAction(() => setWorkspaceModalOpen(true))}
            >
              <Plus /> Tạo workspace mới
            </CommandItem>
            {projects.map((p) => (
              <CommandItem
                key={`new-${p.id}`}
                value={`task new ${p.name}`}
                onSelect={() => runAction(() => setTaskProjectId(p.id))}
              >
                <Plus /> Tạo task trong {p.icon} {p.name}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* ─────────────── Views shortcuts for active projects */}
          {projects.length > 0 && (
            <>
              <CommandGroup heading="Đổi view">
                {projects.slice(0, 5).map((p) => (
                  <CommandItem
                    key={`view-list-${p.id}`}
                    value={`list view ${p.name}`}
                    onSelect={() =>
                      navigateTo(`/dashboard/workspace/${p.workspaceId}/project/${p.id}/list`)
                    }
                  >
                    <List /> List view: {p.name}
                  </CommandItem>
                ))}
                {projects.slice(0, 5).map((p) => (
                  <CommandItem
                    key={`view-cal-${p.id}`}
                    value={`calendar ${p.name}`}
                    onSelect={() =>
                      navigateTo(`/dashboard/workspace/${p.workspaceId}/project/${p.id}/calendar`)
                    }
                  >
                    <CalendarDays /> Calendar: {p.name}
                  </CommandItem>
                ))}
                {projects.slice(0, 5).map((p) => (
                  <CommandItem
                    key={`view-kb-${p.id}`}
                    value={`kanban ${p.name}`}
                    onSelect={() =>
                      navigateTo(`/dashboard/workspace/${p.workspaceId}/project/${p.id}`)
                    }
                  >
                    <KanbanSquare /> Kanban: {p.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* ─────────────── Theme */}
          <CommandGroup heading="Theme">
            <CommandItem value="theme light" onSelect={() => runAction(() => setTheme("light"))}>
              <Sun /> Chuyển sang Light
            </CommandItem>
            <CommandItem value="theme dark" onSelect={() => runAction(() => setTheme("dark"))}>
              <Moon /> Chuyển sang Dark
            </CommandItem>
            <CommandItem value="theme system" onSelect={() => runAction(() => setTheme("system"))}>
              <Monitor /> Theo hệ thống
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* ─────────────── General */}
          <CommandGroup heading="Khác">
            <CommandItem value="export data" onSelect={handleExport}>
              <Download /> Export dữ liệu (JSON)
            </CommandItem>
            <CommandItem value="help shortcuts" onSelect={() => runAction(() => setHelpOpen(true))}>
              <KeyRound /> Xem phím tắt
              <CommandShortcut>{SHORTCUTS.HELP.keys.join("")}</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="logout signout"
              onSelect={() => runAction(logout)}
              className="text-destructive aria-selected:text-destructive"
            >
              <LogOut /> Đăng xuất
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <ShortcutsHelpDialog open={helpOpen} onOpenChange={setHelpOpen} />

      {workspaceModalOpen && (
        <WorkspaceFormDialog
          mode="create"
          open={workspaceModalOpen}
          onOpenChange={setWorkspaceModalOpen}
        />
      )}

      {taskProjectId && (
        <TaskModal
          mode="create"
          projectId={taskProjectId}
          open={taskProjectId !== null}
          onOpenChange={(o) => !o && setTaskProjectId(null)}
        />
      )}
    </>
  );
}
