"use client";

import { useParams } from "next/navigation";

import { TaskListView } from "@/components/features/list-view/task-list-view";

export default function ProjectListPage() {
  const params = useParams<{ projectId: string }>();
  return <TaskListView projectId={params.projectId} />;
}
