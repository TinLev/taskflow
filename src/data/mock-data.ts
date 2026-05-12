import { addDays, subDays } from "date-fns";

import type { Project, Task, User, Workspace } from "@/types";

/**
 * Seed data for first-time users / demo account.
 *
 * Design rules:
 *  - IDs are stable string literals (no `newId()`) so re-seeding produces
 *    the same dataset and selectors stay valid across reloads.
 *  - Dates are computed relative to "now" so the dataset always feels
 *    fresh (one task is always overdue, one always due tomorrow, etc.).
 *  - Covers every status & priority combo so each view has variety.
 */

const now = new Date();

/* ─────────────────────────────────────────── User */
export const DEMO_USER: User = {
  id: "user_demo",
  name: "Demo User",
  email: "demo@taskflow.app",
  createdAt: subDays(now, 30),
};

/* ─────────────────────────────────────────── Workspaces */
export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: "ws_personal",
    name: "Personal",
    icon: "🏠",
    ownerId: DEMO_USER.id,
    order: 0,
    createdAt: subDays(now, 30),
  },
  {
    id: "ws_study",
    name: "Học tập",
    icon: "📚",
    ownerId: DEMO_USER.id,
    order: 1,
    createdAt: subDays(now, 25),
  },
];

/* ─────────────────────────────────────────── Projects */
export const MOCK_PROJECTS: Project[] = [
  {
    id: "prj_home",
    workspaceId: "ws_personal",
    name: "Việc nhà",
    description: "Công việc cá nhân hằng ngày",
    color: "#6366f1",
    icon: "🏡",
    order: 0,
    createdAt: subDays(now, 28),
  },
  {
    id: "prj_portfolio",
    workspaceId: "ws_personal",
    name: "Portfolio Project",
    description: "Xây TaskFlow để ứng tuyển intern",
    color: "#10b981",
    icon: "🚀",
    order: 1,
    createdAt: subDays(now, 20),
  },
  {
    id: "prj_react",
    workspaceId: "ws_study",
    name: "Học React",
    description: "Roadmap mastery: hooks, context, patterns",
    color: "#f97316",
    icon: "⚛️",
    order: 0,
    createdAt: subDays(now, 22),
  },
  {
    id: "prj_eng",
    workspaceId: "ws_study",
    name: "English Practice",
    description: "IELTS 7.0 goal",
    color: "#ec4899",
    icon: "🇬🇧",
    order: 1,
    createdAt: subDays(now, 15),
  },
];

/* ─────────────────────────────────────────── Tasks */
export const MOCK_TASKS: Task[] = [
  // ── Portfolio project (variety of all statuses)
  {
    id: "t_setup",
    projectId: "prj_portfolio",
    title: "Setup Next.js + TypeScript + Tailwind",
    status: "done",
    priority: "high",
    tags: ["setup"],
    subtasks: [],
    order: 0,
    createdAt: subDays(now, 14),
    updatedAt: subDays(now, 13),
  },
  {
    id: "t_datamodel",
    projectId: "prj_portfolio",
    title: "Định nghĩa Data Models",
    description: "User, Workspace, Project, Task — zod-first inferred types",
    status: "done",
    priority: "high",
    tags: ["foundation"],
    subtasks: [
      { id: "st_dm_1", title: "User schema", completed: true },
      { id: "st_dm_2", title: "Task schema", completed: true },
      { id: "st_dm_3", title: "Workspace + Project schemas", completed: true },
    ],
    order: 1,
    createdAt: subDays(now, 13),
    updatedAt: subDays(now, 12),
  },
  {
    id: "t_kanban",
    projectId: "prj_portfolio",
    title: "Xây Kanban Board với drag & drop",
    description: "Tích hợp @dnd-kit, optimistic updates, smooth animations",
    status: "in_progress",
    priority: "urgent",
    dueDate: addDays(now, 3),
    tags: ["feature", "ui"],
    subtasks: [
      { id: "st_kb_1", title: "Column component", completed: true },
      { id: "st_kb_2", title: "DnD context + sensors", completed: false },
      { id: "st_kb_3", title: "Drag overlay + animation", completed: false },
    ],
    order: 2,
    createdAt: subDays(now, 10),
    updatedAt: subDays(now, 2),
  },
  {
    id: "t_listview",
    projectId: "prj_portfolio",
    title: "List View + Filter + Sort",
    status: "todo",
    priority: "medium",
    dueDate: addDays(now, 7),
    tags: ["feature"],
    subtasks: [],
    order: 3,
    createdAt: subDays(now, 8),
    updatedAt: subDays(now, 8),
  },
  {
    id: "t_calendar",
    projectId: "prj_portfolio",
    title: "Calendar View hiển thị due dates",
    status: "todo",
    priority: "low",
    dueDate: addDays(now, 10),
    tags: ["feature"],
    subtasks: [],
    order: 4,
    createdAt: subDays(now, 7),
    updatedAt: subDays(now, 7),
  },
  {
    id: "t_cmdk",
    projectId: "prj_portfolio",
    title: "Command Palette (như Linear)",
    status: "backlog",
    priority: "low",
    tags: ["nice-to-have"],
    subtasks: [],
    order: 5,
    createdAt: subDays(now, 5),
    updatedAt: subDays(now, 5),
  },
  {
    id: "t_review",
    projectId: "prj_portfolio",
    title: "Code review trước khi demo cho recruiter",
    description: "Self-review: DRY, naming, accessibility, lighthouse",
    status: "review",
    priority: "high",
    dueDate: subDays(now, 1), // overdue — surfaces in dashboard
    tags: ["qa"],
    subtasks: [],
    order: 6,
    createdAt: subDays(now, 4),
    updatedAt: subDays(now, 1),
  },

  // ── Personal — Việc nhà
  {
    id: "t_groceries",
    projectId: "prj_home",
    title: "Mua hoa quả cuối tuần",
    status: "todo",
    priority: "low",
    dueDate: addDays(now, 2),
    tags: ["shopping"],
    subtasks: [],
    order: 0,
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
  {
    id: "t_health",
    projectId: "prj_home",
    title: "Đặt lịch khám sức khỏe định kỳ",
    status: "todo",
    priority: "medium",
    dueDate: addDays(now, 5),
    tags: ["health"],
    subtasks: [],
    order: 1,
    createdAt: subDays(now, 3),
    updatedAt: subDays(now, 3),
  },
  {
    id: "t_bill",
    projectId: "prj_home",
    title: "Đóng tiền điện tháng này",
    status: "done",
    priority: "high",
    tags: ["bills"],
    subtasks: [],
    order: 2,
    createdAt: subDays(now, 10),
    updatedAt: subDays(now, 8),
  },

  // ── Học tập — React
  {
    id: "t_usereducer",
    projectId: "prj_react",
    title: "Hoàn thành chapter useReducer + Context",
    status: "in_progress",
    priority: "medium",
    dueDate: addDays(now, 4),
    tags: ["learning"],
    subtasks: [
      { id: "st_ur_1", title: "Đọc docs", completed: true },
      { id: "st_ur_2", title: "Làm bài tập trên codesandbox", completed: false },
    ],
    order: 0,
    createdAt: subDays(now, 5),
    updatedAt: subDays(now, 1),
  },
  {
    id: "t_context",
    projectId: "prj_react",
    title: "Thực hành Context API với selector pattern",
    status: "todo",
    priority: "high",
    tags: ["learning"],
    subtasks: [],
    order: 1,
    createdAt: subDays(now, 3),
    updatedAt: subDays(now, 3),
  },
  {
    id: "t_redux",
    projectId: "prj_react",
    title: "So sánh Redux Toolkit vs Context+useReducer",
    status: "backlog",
    priority: "low",
    tags: ["learning"],
    subtasks: [],
    order: 2,
    createdAt: subDays(now, 2),
    updatedAt: subDays(now, 2),
  },

  // ── Học tập — English
  {
    id: "t_ielts1",
    projectId: "prj_eng",
    title: "Listen IELTS practice — Section 3",
    status: "done",
    priority: "medium",
    tags: ["ielts"],
    subtasks: [],
    order: 0,
    createdAt: subDays(now, 2),
    updatedAt: subDays(now, 1),
  },
  {
    id: "t_vocab",
    projectId: "prj_eng",
    title: "Học 20 từ vựng mới (chủ đề Technology)",
    status: "in_progress",
    priority: "low",
    dueDate: addDays(now, 1),
    tags: ["vocab"],
    subtasks: [],
    order: 1,
    createdAt: now,
    updatedAt: now,
  },
];
