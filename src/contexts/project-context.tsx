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
import { useWorkspaces } from "@/contexts/workspace-context";
import { DEMO_USER, MOCK_PROJECTS } from "@/data/mock-data";
import { STORAGE_KEYS } from "@/lib/constants";
import { newId } from "@/lib/id";
import { safeStorage } from "@/lib/storage";
import { ProjectsSchema } from "@/lib/validations";
import type { Project } from "@/types";

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
}

type ProjectAction =
  | { type: "HYDRATE"; payload: Project[] }
  | { type: "CREATE"; payload: Project }
  | { type: "UPDATE"; payload: { id: string; patch: Partial<Omit<Project, "id" | "workspaceId">> } }
  | { type: "DELETE"; payload: { id: string } }
  | { type: "DELETE_BY_WORKSPACE"; payload: { workspaceId: string } }
  | { type: "REORDER"; payload: { id: string; newOrder: number } }
  | { type: "RESET" };

const initialState: ProjectState = { projects: [], isLoading: true };

function reducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case "HYDRATE":
      return { projects: action.payload, isLoading: false };
    case "CREATE":
      return { ...state, projects: [...state.projects, action.payload] };
    case "UPDATE":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.patch } : p,
        ),
      };
    case "DELETE":
      return { ...state, projects: state.projects.filter((p) => p.id !== action.payload.id) };
    case "DELETE_BY_WORKSPACE":
      return {
        ...state,
        projects: state.projects.filter((p) => p.workspaceId !== action.payload.workspaceId),
      };
    case "REORDER":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? { ...p, order: action.payload.newOrder } : p,
        ),
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface ProjectContextValue {
  /** Projects of all workspaces owned by current user, sorted by `order`. */
  projects: Project[];
  isLoading: boolean;
  getProject: (id: string) => Project | undefined;
  getProjectsByWorkspace: (workspaceId: string) => Project[];
  createProject: (input: {
    workspaceId: string;
    name: string;
    description?: string;
    color: string;
    icon: string;
  }) => Project | null;
  updateProject: (
    id: string,
    patch: { name?: string; description?: string; color?: string; icon?: string; order?: number },
  ) => void;
  deleteProject: (id: string) => void;
  /** Cascade delete — used by workspace deletion to clean up orphans. */
  deleteProjectsByWorkspace: (workspaceId: string) => void;
  reorderProject: (id: string, newOrder: number) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

/**
 * ProjectProvider
 *
 * Depends on WorkspaceProvider being a parent: it filters projects by
 * "workspaces I own" to ensure user A can't see user B's projects even
 * though the localStorage table is shared.
 *
 * Seeding: when the demo user signs in for the first time and has no
 * projects, we seed from MOCK_PROJECTS. Real users start empty.
 */
export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { workspaces, isLoading: workspacesLoading } = useWorkspaces();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate + optionally seed once auth + workspaces are ready.
  useEffect(() => {
    if (authLoading || workspacesLoading) return;

    if (!user) {
      dispatch({ type: "RESET" });
      return;
    }

    const all = safeStorage.get<Project[]>(STORAGE_KEYS.PROJECTS, ProjectsSchema, []);
    const myWorkspaceIds = new Set(workspaces.map((w) => w.id));
    const mine = all.filter((p) => myWorkspaceIds.has(p.workspaceId));

    let finalAll = all;
    if (mine.length === 0 && user.id === DEMO_USER.id) {
      // Demo user seeding: remap MOCK_PROJECTS to the user's actual
      // workspace IDs (which were assigned fresh during WorkspaceProvider
      // seeding — but since MOCK_WORKSPACES use stable IDs and so do
      // MOCK_PROJECTS' workspaceIds, this mapping is identity).
      const mockWorkspaceIds = new Set(workspaces.map((w) => w.id));
      const seeded = MOCK_PROJECTS.filter((p) => mockWorkspaceIds.has(p.workspaceId));
      finalAll = [...all, ...seeded];
      safeStorage.set(STORAGE_KEYS.PROJECTS, finalAll);
    }

    dispatch({ type: "HYDRATE", payload: finalAll });
  }, [authLoading, workspacesLoading, user, workspaces]);

  // Persist on change.
  useEffect(() => {
    if (state.isLoading) return;
    safeStorage.set(STORAGE_KEYS.PROJECTS, state.projects);
  }, [state.projects, state.isLoading]);

  /* ─────────────── Selectors ─────────────── */
  const myWorkspaceIds = useMemo(() => new Set(workspaces.map((w) => w.id)), [workspaces]);

  const myProjects = useMemo(
    () =>
      state.projects
        .filter((p) => myWorkspaceIds.has(p.workspaceId))
        .sort((a, b) => a.order - b.order),
    [state.projects, myWorkspaceIds],
  );

  const getProject = useCallback((id: string) => myProjects.find((p) => p.id === id), [myProjects]);

  const getProjectsByWorkspace = useCallback(
    (workspaceId: string) => myProjects.filter((p) => p.workspaceId === workspaceId),
    [myProjects],
  );

  /* ─────────────── Mutations ─────────────── */
  const createProject = useCallback<ProjectContextValue["createProject"]>(
    (input) => {
      if (!myWorkspaceIds.has(input.workspaceId)) return null;
      const sameWsProjects = myProjects.filter((p) => p.workspaceId === input.workspaceId);
      const maxOrder = sameWsProjects.reduce((m, p) => Math.max(m, p.order), -1);
      const project: Project = {
        id: newId("prj"),
        workspaceId: input.workspaceId,
        name: input.name.trim(),
        ...(input.description?.trim() ? { description: input.description.trim() } : {}),
        color: input.color,
        icon: input.icon || "📁",
        order: maxOrder + 1,
        createdAt: new Date(),
      };
      dispatch({ type: "CREATE", payload: project });
      return project;
    },
    [myWorkspaceIds, myProjects],
  );

  const updateProject = useCallback<ProjectContextValue["updateProject"]>(
    (id, patch) => {
      const target = state.projects.find((p) => p.id === id);
      if (!target || !myWorkspaceIds.has(target.workspaceId)) return;
      dispatch({ type: "UPDATE", payload: { id, patch } });
    },
    [state.projects, myWorkspaceIds],
  );

  const deleteProject = useCallback<ProjectContextValue["deleteProject"]>(
    (id) => {
      const target = state.projects.find((p) => p.id === id);
      if (!target || !myWorkspaceIds.has(target.workspaceId)) return;
      dispatch({ type: "DELETE", payload: { id } });
    },
    [state.projects, myWorkspaceIds],
  );

  const deleteProjectsByWorkspace = useCallback<ProjectContextValue["deleteProjectsByWorkspace"]>(
    (workspaceId) => {
      dispatch({ type: "DELETE_BY_WORKSPACE", payload: { workspaceId } });
    },
    [],
  );

  const reorderProject = useCallback<ProjectContextValue["reorderProject"]>(
    (id, newOrder) => {
      const target = state.projects.find((p) => p.id === id);
      if (!target || !myWorkspaceIds.has(target.workspaceId)) return;
      dispatch({ type: "REORDER", payload: { id, newOrder } });
    },
    [state.projects, myWorkspaceIds],
  );

  const value = useMemo<ProjectContextValue>(
    () => ({
      projects: myProjects,
      isLoading: state.isLoading,
      getProject,
      getProjectsByWorkspace,
      createProject,
      updateProject,
      deleteProject,
      deleteProjectsByWorkspace,
      reorderProject,
    }),
    [
      myProjects,
      state.isLoading,
      getProject,
      getProjectsByWorkspace,
      createProject,
      updateProject,
      deleteProject,
      deleteProjectsByWorkspace,
      reorderProject,
    ],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within <ProjectProvider>");
  return ctx;
}
