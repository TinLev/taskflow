"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import { useAuth } from "@/contexts/auth-context";
import { useProjects } from "@/contexts/project-context";
import { DEMO_USER, MOCK_TASKS } from "@/data/mock-data";
import { STORAGE_KEYS } from "@/lib/constants";
import { newId } from "@/lib/id";
import { safeStorage } from "@/lib/storage";
import { TasksSchema } from "@/lib/validations";
import type { Subtask, Task, TaskPriority, TaskStatus } from "@/types";

/* ───────────────────────────────────────────────────────────────
 * State, actions, reducer
 *
 * `state.tasks` is the full table across all users. Selectors filter
 * to "my tasks" by checking task.projectId ∈ my project IDs (which in
 * turn is scoped via WorkspaceProvider's ownerId filter).
 * ─────────────────────────────────────────────────────────── */
interface TaskState {
  tasks: Task[];
  isLoading: boolean;
}

type TaskAction =
  | { type: "HYDRATE"; payload: Task[] }
  | { type: "CREATE"; payload: Task }
  | { type: "UPDATE"; payload: { id: string; patch: Partial<Task> } }
  | { type: "BATCH_UPDATE"; payload: Array<{ id: string; patch: Partial<Task> }> }
  | { type: "DELETE"; payload: { id: string } }
  | { type: "DELETE_BY_PROJECT"; payload: { projectId: string } }
  | { type: "DELETE_BY_PROJECTS"; payload: { projectIds: string[] } }
  | { type: "RESET" };

const initialState: TaskState = { tasks: [], isLoading: true };

function reducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "HYDRATE":
      return { tasks: action.payload, isLoading: false };
    case "CREATE":
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "UPDATE":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.patch } : t,
        ),
      };
    case "BATCH_UPDATE": {
      const patchMap = new Map(action.payload.map((p) => [p.id, p.patch]));
      return {
        ...state,
        tasks: state.tasks.map((t) => (patchMap.has(t.id) ? { ...t, ...patchMap.get(t.id)! } : t)),
      };
    }
    case "DELETE":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload.id) };
    case "DELETE_BY_PROJECT":
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.projectId !== action.payload.projectId),
      };
    case "DELETE_BY_PROJECTS": {
      const projectIds = new Set(action.payload.projectIds);
      return { ...state, tasks: state.tasks.filter((t) => !projectIds.has(t.projectId)) };
    }
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

/* ───────────────────────────────────────────────────────────────
 * Context API
 * ─────────────────────────────────────────────────────────── */
type CreateTaskInput = {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  tags?: string[];
  assigneeId?: string;
};

interface TaskContextValue {
  /** All tasks owned by the current user, sorted by `order`. */
  tasks: Task[];
  isLoading: boolean;

  // Queries
  getTask: (id: string) => Task | undefined;
  getTasksByProject: (projectId: string) => Task[];

  // CRUD
  createTask: (input: CreateTaskInput) => Task | null;
  updateTask: (id: string, patch: Partial<Omit<Task, "id" | "projectId" | "createdAt">>) => void;
  deleteTask: (id: string) => void;
  deleteTasksByProject: (projectId: string) => void;
  deleteTasksByProjects: (projectIds: string[]) => void;

  // Drag-and-drop helper — reseats every task in a (project, status)
  // pair with consecutive `order` values matching `orderedIds`. Tasks
  // crossing columns get their status overwritten too.
  reorderColumn: (projectId: string, status: TaskStatus, orderedIds: string[]) => void;

  // Subtask helpers (operate on an existing task's `subtasks` array)
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

const now = () => new Date();

/**
 * TaskProvider
 *
 * Hydrates and persists `taskflow:tasks`. Seeds MOCK_TASKS for the demo
 * user on first sign-in (mirroring WorkspaceProvider / ProjectProvider).
 *
 * Drag-and-drop:
 *  - `reorderColumn` is the canonical mutation. Components compute the
 *    new ordered ID list (e.g. via @dnd-kit's `arrayMove`) and pass it
 *    here; the reducer writes consecutive integer orders. This avoids
 *    fractional-ordering complexity at the cost of a single batched
 *    re-render — acceptable for column sizes seen in real usage.
 */
export function TaskProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { projects, isLoading: projectsLoading } = useProjects();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate (and seed when empty) once everything upstream settles.
  useEffect(() => {
    if (authLoading || projectsLoading) return;

    if (!user) {
      dispatch({ type: "RESET" });
      return;
    }

    const all = safeStorage.get<Task[]>(STORAGE_KEYS.TASKS, TasksSchema, []);
    const myProjectIds = new Set(projects.map((p) => p.id));
    const mine = all.filter((t) => myProjectIds.has(t.projectId));

    let finalAll = all;
    if (mine.length === 0 && user.id === DEMO_USER.id) {
      const mockProjectIds = new Set(projects.map((p) => p.id));
      const seeded = MOCK_TASKS.filter((t) => mockProjectIds.has(t.projectId));
      finalAll = [...all, ...seeded];
      safeStorage.set(STORAGE_KEYS.TASKS, finalAll);
    }

    dispatch({ type: "HYDRATE", payload: finalAll });
  }, [authLoading, projectsLoading, user, projects]);

  // Persist on change.
  useEffect(() => {
    if (state.isLoading) return;
    safeStorage.set(STORAGE_KEYS.TASKS, state.tasks);
  }, [state.tasks, state.isLoading]);

  /* ─────────────── Selectors ─────────────── */
  const myProjectIds = useMemo(() => new Set(projects.map((p) => p.id)), [projects]);

  const myTasks = useMemo(
    () =>
      state.tasks.filter((t) => myProjectIds.has(t.projectId)).sort((a, b) => a.order - b.order),
    [state.tasks, myProjectIds],
  );

  const getTask = useCallback((id: string) => myTasks.find((t) => t.id === id), [myTasks]);

  const getTasksByProject = useCallback(
    (projectId: string) => myTasks.filter((t) => t.projectId === projectId),
    [myTasks],
  );

  /* ─────────────── Mutations ─────────────── */
  const createTask = useCallback<TaskContextValue["createTask"]>(
    (input) => {
      if (!myProjectIds.has(input.projectId)) return null;
      const status: TaskStatus = input.status ?? "todo";
      const sameColumn = state.tasks.filter(
        (t) => t.projectId === input.projectId && t.status === status,
      );
      const maxOrder = sameColumn.reduce((m, t) => Math.max(m, t.order), -1);
      const created: Task = {
        id: newId("task"),
        projectId: input.projectId,
        title: input.title.trim(),
        ...(input.description?.trim() ? { description: input.description.trim() } : {}),
        status,
        priority: input.priority ?? "medium",
        ...(input.dueDate ? { dueDate: input.dueDate } : {}),
        tags: input.tags ?? [],
        ...(input.assigneeId ? { assigneeId: input.assigneeId } : {}),
        subtasks: [],
        order: maxOrder + 1,
        createdAt: now(),
        updatedAt: now(),
      };
      dispatch({ type: "CREATE", payload: created });
      return created;
    },
    [state.tasks, myProjectIds],
  );

  const updateTask = useCallback<TaskContextValue["updateTask"]>(
    (id, patch) => {
      const target = state.tasks.find((t) => t.id === id);
      if (!target || !myProjectIds.has(target.projectId)) return;
      dispatch({ type: "UPDATE", payload: { id, patch: { ...patch, updatedAt: now() } } });
    },
    [state.tasks, myProjectIds],
  );

  const deleteTask = useCallback<TaskContextValue["deleteTask"]>(
    (id) => {
      const target = state.tasks.find((t) => t.id === id);
      if (!target || !myProjectIds.has(target.projectId)) return;
      dispatch({ type: "DELETE", payload: { id } });
    },
    [state.tasks, myProjectIds],
  );

  const deleteTasksByProject = useCallback<TaskContextValue["deleteTasksByProject"]>(
    (projectId) => dispatch({ type: "DELETE_BY_PROJECT", payload: { projectId } }),
    [],
  );

  const deleteTasksByProjects = useCallback<TaskContextValue["deleteTasksByProjects"]>(
    (projectIds) => dispatch({ type: "DELETE_BY_PROJECTS", payload: { projectIds } }),
    [],
  );

  const reorderColumn = useCallback<TaskContextValue["reorderColumn"]>(
    (projectId, status, orderedIds) => {
      if (!myProjectIds.has(projectId)) return;
      const t = now();
      dispatch({
        type: "BATCH_UPDATE",
        payload: orderedIds.map((id, index) => ({
          id,
          patch: { status, order: index, updatedAt: t },
        })),
      });
    },
    [myProjectIds],
  );

  const addSubtask = useCallback<TaskContextValue["addSubtask"]>(
    (taskId, title) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const target = state.tasks.find((t) => t.id === taskId);
      if (!target || !myProjectIds.has(target.projectId)) return;
      const newSub: Subtask = { id: newId("st"), title: trimmed, completed: false };
      dispatch({
        type: "UPDATE",
        payload: {
          id: taskId,
          patch: { subtasks: [...target.subtasks, newSub], updatedAt: now() },
        },
      });
    },
    [state.tasks, myProjectIds],
  );

  const toggleSubtask = useCallback<TaskContextValue["toggleSubtask"]>(
    (taskId, subtaskId) => {
      const target = state.tasks.find((t) => t.id === taskId);
      if (!target || !myProjectIds.has(target.projectId)) return;
      dispatch({
        type: "UPDATE",
        payload: {
          id: taskId,
          patch: {
            subtasks: target.subtasks.map((s) =>
              s.id === subtaskId ? { ...s, completed: !s.completed } : s,
            ),
            updatedAt: now(),
          },
        },
      });
    },
    [state.tasks, myProjectIds],
  );

  const deleteSubtask = useCallback<TaskContextValue["deleteSubtask"]>(
    (taskId, subtaskId) => {
      const target = state.tasks.find((t) => t.id === taskId);
      if (!target || !myProjectIds.has(target.projectId)) return;
      dispatch({
        type: "UPDATE",
        payload: {
          id: taskId,
          patch: {
            subtasks: target.subtasks.filter((s) => s.id !== subtaskId),
            updatedAt: now(),
          },
        },
      });
    },
    [state.tasks, myProjectIds],
  );

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks: myTasks,
      isLoading: state.isLoading,
      getTask,
      getTasksByProject,
      createTask,
      updateTask,
      deleteTask,
      deleteTasksByProject,
      deleteTasksByProjects,
      reorderColumn,
      addSubtask,
      toggleSubtask,
      deleteSubtask,
    }),
    [
      myTasks,
      state.isLoading,
      getTask,
      getTasksByProject,
      createTask,
      updateTask,
      deleteTask,
      deleteTasksByProject,
      deleteTasksByProjects,
      reorderColumn,
      addSubtask,
      toggleSubtask,
      deleteSubtask,
    ],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within <TaskProvider>");
  return ctx;
}
