import { z } from "zod";

/* ───────────────────────────────────────────────────────────────
 * Enum schemas (single source of truth for status/priority)
 * ─────────────────────────────────────────────────────────── */
export const TaskStatusSchema = z.enum(["backlog", "todo", "in_progress", "review", "done"]);
export const TaskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

/* ───────────────────────────────────────────────────────────────
 * Domain schemas
 * Dates use z.coerce.date() so they accept both Date and ISO string
 * (localStorage round-trips strings).
 * ─────────────────────────────────────────────────────────── */
export const SubtaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Subtask không được trống").max(120),
  completed: z.boolean(),
});

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Tên không được trống").max(80),
  email: z.email("Email không hợp lệ"),
  avatar: z.string().url().optional(),
  createdAt: z.coerce.date(),
});

export const WorkspaceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Tên workspace không được trống").max(60),
  icon: z.string().min(1).max(4),
  ownerId: z.string().min(1),
  order: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
});

export const ProjectSchema = z.object({
  id: z.string().min(1),
  workspaceId: z.string().min(1),
  name: z.string().min(1, "Tên project không được trống").max(80),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color phải là hex #rrggbb"),
  icon: z.string().min(1).max(4),
  order: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
});

export const TaskSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string().min(1, "Tiêu đề không được trống").max(200),
  description: z.string().max(5000).optional(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  dueDate: z.coerce.date().optional(),
  tags: z.array(z.string().min(1).max(30)).default([]),
  assigneeId: z.string().min(1).optional(),
  subtasks: z.array(SubtaskSchema).default([]),
  order: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/* ───────────────────────────────────────────────────────────────
 * Collection schemas — what we persist in localStorage
 * Using arrays (not Record<id, T>) for simpler iteration; lookups
 * happen via .find() / .filter() in selectors.
 * ─────────────────────────────────────────────────────────── */
export const WorkspacesSchema = z.array(WorkspaceSchema);
export const ProjectsSchema = z.array(ProjectSchema);
export const TasksSchema = z.array(TaskSchema);

/* ───────────────────────────────────────────────────────────────
 * Auth — stored credentials.
 *
 * ⚠️ DEMO ONLY: passwords are kept in plaintext in localStorage.
 * In production, NEVER store passwords in the client. Use a real
 * backend with a slow KDF (bcrypt / argon2) and HTTPS-only cookies.
 * This is acceptable here because the app is a self-contained
 * frontend demo with no real user data.
 * ─────────────────────────────────────────────────────────── */
export const StoredUserSchema = z.object({
  user: UserSchema,
  password: z.string().min(6),
});
export const StoredUsersSchema = z.array(StoredUserSchema);

/* ───────────────────────────────────────────────────────────────
 * Form schemas — auth & CRUD inputs
 * ─────────────────────────────────────────────────────────── */
export const LoginSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const RegisterSchema = z
  .object({
    name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(80),
    email: z.email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const WorkspaceFormSchema = WorkspaceSchema.pick({
  name: true,
  icon: true,
});

export const ProjectFormSchema = ProjectSchema.pick({
  name: true,
  description: true,
  color: true,
  icon: true,
});

/**
 * TaskFormSchema — defined inline (not picked from TaskSchema) so we can
 * use plain `z.date()` instead of `z.coerce.date()`. Forms work with Date
 * objects directly; the storage layer keeps coercion for ISO round-trips.
 */
export const TaskFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được trống").max(200),
  description: z.string().max(5000).optional(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  dueDate: z.date().optional(),
  tags: z.array(z.string().min(1).max(30)).default([]),
  assigneeId: z.string().min(1).optional(),
});

/* ───────────────────────────────────────────────────────────────
 * Form input types (use in react-hook-form).
 *
 * Note on z.input vs z.infer: schemas with `.default(...)` produce
 * different types — the OUTPUT (post-parse) makes the field required,
 * but the INPUT (what the form actually provides) leaves it optional.
 * React Hook Form's resolver works with the INPUT type, so we explicitly
 * pick `z.input<>` here to keep TS in sync with runtime expectations.
 * ─────────────────────────────────────────────────────────── */
export type LoginInput = z.input<typeof LoginSchema>;
export type RegisterInput = z.input<typeof RegisterSchema>;
export type WorkspaceFormInput = z.input<typeof WorkspaceFormSchema>;
export type ProjectFormInput = z.input<typeof ProjectFormSchema>;
export type TaskFormInput = z.input<typeof TaskFormSchema>;
