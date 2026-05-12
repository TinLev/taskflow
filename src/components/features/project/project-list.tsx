"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ProjectFormDialog } from "@/components/features/project/project-form-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useProjects } from "@/contexts/project-context";
import { useWorkspaces } from "@/contexts/workspace-context";
import { cn } from "@/lib/utils";

interface ProjectListProps {
  /** Called after a navigation tap — used by mobile drawer to close. */
  onNavigate?: () => void;
}

/**
 * ProjectList — sidebar section showing projects of the active workspace.
 *
 * Each item is a Link to /dashboard/workspace/[ws]/project/[id]. Active
 * link is detected via the URL pathname (project IDs are stable strings).
 */
export function ProjectList({ onNavigate }: ProjectListProps) {
  const { activeWorkspace } = useWorkspaces();
  const { getProjectsByWorkspace } = useProjects();
  const pathname = usePathname();
  const [createOpen, setCreateOpen] = useState(false);

  if (!activeWorkspace) {
    return (
      <div className="text-muted-foreground bg-muted/40 border-border/60 rounded-md border border-dashed px-3 py-4 text-xs">
        Chọn một workspace ở trên để xem projects.
      </div>
    );
  }

  const projects = getProjectsByWorkspace(activeWorkspace.id);

  return (
    <>
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Projects
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-5"
              onClick={() => setCreateOpen(true)}
              aria-label="Tạo project mới"
            >
              <Plus className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Tạo project mới</TooltipContent>
        </Tooltip>
      </div>

      {projects.length === 0 ? (
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="text-muted-foreground hover:bg-secondary/60 bg-muted/40 border-border/60 hover:text-foreground w-full rounded-md border border-dashed px-3 py-3 text-left text-xs transition-colors"
        >
          <Plus className="mb-1 inline size-3.5" /> Chưa có project nào.
          <br />
          Click để tạo mới.
        </button>
      ) : (
        <ScrollArea className="max-h-[calc(100vh-280px)]">
          <ul className="space-y-0.5">
            {projects.map((p) => {
              const href = `/dashboard/workspace/${activeWorkspace.id}/project/${p.id}`;
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={p.id}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-secondary text-secondary-foreground font-medium"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: p.color }}
                      aria-hidden
                    />
                    <span className="text-base leading-none">{p.icon}</span>
                    <span className="flex-1 truncate">{p.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      )}

      <ProjectFormDialog
        mode="create"
        workspaceId={activeWorkspace.id}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  );
}
