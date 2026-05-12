"use client";

import { Check, ChevronsUpDown, Plus, Settings2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { WorkspaceFormDialog } from "@/components/features/workspace/workspace-form-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaces } from "@/contexts/workspace-context";
import { cn } from "@/lib/utils";

interface WorkspaceSwitcherProps {
  /** Hide the chevron / dropdown affordance and render read-only header style. */
  readOnly?: boolean;
}

/**
 * WorkspaceSwitcher — sidebar dropdown to view / switch / create workspaces.
 *
 * Switching does two things:
 *  1. Updates the persisted activeWorkspaceId.
 *  2. Navigates to /dashboard/workspace/[id] so the URL stays in sync
 *     with what the sidebar shows.
 */
export function WorkspaceSwitcher({ readOnly }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaces();
  const [createOpen, setCreateOpen] = useState(false);

  function handleSelect(id: string) {
    setActiveWorkspace(id);
    router.push(`/dashboard/workspace/${id}`);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={readOnly}>
          <Button
            variant="ghost"
            className={cn(
              "h-auto w-full justify-start gap-2 px-2 py-1.5",
              !readOnly && "hover:bg-secondary",
            )}
          >
            <span className="bg-secondary inline-flex size-8 shrink-0 items-center justify-center rounded-md text-base">
              {activeWorkspace?.icon ?? "📁"}
            </span>
            <span className="flex min-w-0 flex-1 flex-col items-start text-left">
              <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Workspace
              </span>
              <span className="w-full truncate text-sm font-medium">
                {activeWorkspace?.name ?? "Chưa chọn"}
              </span>
            </span>
            {!readOnly && <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel className="text-muted-foreground text-xs">
            Workspaces của bạn
          </DropdownMenuLabel>
          {workspaces.length === 0 ? (
            <div className="text-muted-foreground px-2 py-2 text-sm">Chưa có workspace nào.</div>
          ) : (
            workspaces.map((w) => (
              <DropdownMenuItem
                key={w.id}
                onClick={() => handleSelect(w.id)}
                className="cursor-pointer"
              >
                <span className="text-base">{w.icon}</span>
                <span className="flex-1 truncate">{w.name}</span>
                {w.id === activeWorkspace?.id && <Check className="size-4 opacity-60" />}
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Tạo workspace mới
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings2 className="size-4" />
              Quản lý workspaces
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <WorkspaceFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={(ws) => router.push(`/dashboard/workspace/${ws.id}`)}
      />
    </>
  );
}
