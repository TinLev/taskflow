"use client";

import { useParams } from "next/navigation";

import { TaskCalendarView } from "@/components/features/calendar-view/task-calendar-view";

export default function ProjectCalendarPage() {
  const params = useParams<{ projectId: string }>();
  return <TaskCalendarView projectId={params.projectId} />;
}
