"use client";

import { useParams } from "next/navigation";

import { KanbanBoard } from "@/components/features/kanban/kanban-board";

export default function ProjectKanbanPage() {
  const params = useParams<{ projectId: string }>();
  return <KanbanBoard projectId={params.projectId} />;
}
