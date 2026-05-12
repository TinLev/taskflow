"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ProjectFormDialog } from "@/components/features/project/project-form-dialog";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects } from "@/contexts/project-context";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  /** href to open project view (Phase 4 wires Kanban). */
  href: string;
}

export function ProjectCard({ project, href }: ProjectCardProps) {
  const { deleteProject } = useProjects();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleConfirmDelete() {
    deleteProject(project.id);
    toast.success(`Đã xóa project "${project.name}"`);
    setDeleteOpen(false);
  }

  return (
    <>
      <Card className="group hover:border-foreground/15 relative overflow-hidden transition-all hover:shadow-md">
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: project.color }}
          aria-hidden
        />
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            <Link href={href} className="flex min-w-0 flex-1 items-center gap-2.5">
              <span className="text-2xl leading-none">{project.icon}</span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold">{project.name}</span>
                {project.description && (
                  <span className="text-muted-foreground truncate text-xs">
                    {project.description}
                  </span>
                )}
              </span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label="Tùy chọn project"
                >
                  <MoreHorizontal className="size-4" />
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

          <Link href={href} className="mt-4 block">
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <span>—</span>
              <span className="opacity-60">Tasks sẽ xuất hiện ở Phase 4</span>
            </div>
          </Link>
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
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Xóa project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
