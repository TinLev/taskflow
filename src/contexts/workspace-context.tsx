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
import { z } from "zod";

import { useAuth } from "@/contexts/auth-context";
import { DEMO_USER, MOCK_WORKSPACES } from "@/data/mock-data";
import { STORAGE_KEYS } from "@/lib/constants";
import { newId } from "@/lib/id";
import { safeStorage } from "@/lib/storage";
import { WorkspacesSchema } from "@/lib/validations";
import type { Workspace } from "@/types";

/* ───────────────────────────────────────────────────────────────
 * State, actions, reducer
 *
 * `state.workspaces` holds ALL workspaces in storage (across every
 * user that has used this browser). The hook returns a filtered view
 * scoped to the current user. This mirrors a real backend where the
 * DB stores all rows and queries filter by `ownerId`.
 * ─────────────────────────────────────────────────────────── */
interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
}

type WorkspaceAction =
  | { type: "HYDRATE"; payload: { workspaces: Workspace[]; activeId: string | null } }
  | { type: "CREATE"; payload: Workspace }
  | { type: "UPDATE"; payload: { id: string; patch: Partial<Omit<Workspace, "id" | "ownerId">> } }
  | { type: "DELETE"; payload: { id: string } }
  | { type: "SET_ACTIVE"; payload: { id: string | null } }
  | { type: "RESET" };

const initialState: WorkspaceState = {
  workspaces: [],
  activeWorkspaceId: null,
  isLoading: true,
};

function reducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "HYDRATE":
      return {
        workspaces: action.payload.workspaces,
        activeWorkspaceId: action.payload.activeId,
        isLoading: false,
      };
    case "CREATE":
      return { ...state, workspaces: [...state.workspaces, action.payload] };
    case "UPDATE":
      return {
        ...state,
        workspaces: state.workspaces.map((w) =>
          w.id === action.payload.id ? { ...w, ...action.payload.patch } : w,
        ),
      };
    case "DELETE": {
      const next = state.workspaces.filter((w) => w.id !== action.payload.id);
      // If we just deleted the active one, leave activeId dangling; the
      // selector + components fall back gracefully (see useWorkspaces).
      return { ...state, workspaces: next };
    }
    case "SET_ACTIVE":
      return { ...state, activeWorkspaceId: action.payload.id };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

/* ───────────────────────────────────────────────────────────────
 * Context value (what consumers see)
 * ─────────────────────────────────────────────────────────── */
interface WorkspaceContextValue {
  /** Workspaces owned by the current user, ordered by `order` ASC */
  workspaces: Workspace[];
  /** The currently selected workspace, or null if none / not loaded */
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  createWorkspace: (input: { name: string; icon: string }) => Workspace | null;
  updateWorkspace: (id: string, patch: { name?: string; icon?: string; order?: number }) => void;
  /** Removes the workspace. Caller is responsible for cascading project deletion. */
  deleteWorkspace: (id: string) => void;
  setActiveWorkspace: (id: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const ActiveWorkspaceIdSchema = z.string().nullable();

/**
 * WorkspaceProvider
 *
 * Lifecycle:
 *  1. Wait for auth to finish loading.
 *  2. Hydrate workspaces from localStorage.
 *  3. If the current user has zero workspaces, seed them:
 *     - Demo user → mock data from data/mock-data.ts (rich showcase)
 *     - Real user → a single empty "Personal" workspace
 *  4. Persist workspaces and active workspace ID on every change.
 *
 * On logout (user transitions to null), the reducer is reset to clear
 * the in-memory state, but localStorage is intentionally NOT wiped —
 * the user's data should still be there when they log back in.
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate (and seed when empty) once auth settles.
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      dispatch({ type: "RESET" });
      return;
    }

    const all = safeStorage.get<Workspace[]>(STORAGE_KEYS.WORKSPACES, WorkspacesSchema, []);
    const mine = all.filter((w) => w.ownerId === user.id);

    let finalAll = all;
    let mineAfterSeed = mine;

    if (mine.length === 0) {
      // Seed strategy: demo user gets rich mock data; everyone else
      // gets a single fresh "Personal" workspace.
      const isDemo = user.id === DEMO_USER.id;
      const seeded: Workspace[] = isDemo
        ? MOCK_WORKSPACES.map((w) => ({ ...w, ownerId: user.id }))
        : [
            {
              id: newId("ws"),
              name: "Personal",
              icon: "🏠",
              ownerId: user.id,
              order: 0,
              createdAt: new Date(),
            },
          ];
      finalAll = [...all, ...seeded];
      mineAfterSeed = seeded;
      safeStorage.set(STORAGE_KEYS.WORKSPACES, finalAll);
    }

    // Restore last-active workspace (persisted globally — not per-user)
    // and validate it still belongs to the current user.
    const persistedActive = safeStorage.get<string | null>(
      STORAGE_KEYS.ACTIVE_WORKSPACE,
      ActiveWorkspaceIdSchema,
      null,
    );
    const activeIsMine = mineAfterSeed.some((w) => w.id === persistedActive);
    const activeId = activeIsMine ? persistedActive : (mineAfterSeed[0]?.id ?? null);

    dispatch({ type: "HYDRATE", payload: { workspaces: finalAll, activeId } });
  }, [authLoading, user]);

  // Persist workspaces on every change (skip during the initial loading tick).
  useEffect(() => {
    if (state.isLoading) return;
    safeStorage.set(STORAGE_KEYS.WORKSPACES, state.workspaces);
  }, [state.workspaces, state.isLoading]);

  // Persist active workspace ID.
  useEffect(() => {
    if (state.isLoading) return;
    safeStorage.set(STORAGE_KEYS.ACTIVE_WORKSPACE, state.activeWorkspaceId);
  }, [state.activeWorkspaceId, state.isLoading]);

  /* ─────────────── Selectors (memoized) ─────────────── */
  const myWorkspaces = useMemo(() => {
    if (!user) return [];
    return state.workspaces.filter((w) => w.ownerId === user.id).sort((a, b) => a.order - b.order);
  }, [state.workspaces, user]);

  const activeWorkspace = useMemo(() => {
    if (!state.activeWorkspaceId) return null;
    return myWorkspaces.find((w) => w.id === state.activeWorkspaceId) ?? null;
  }, [myWorkspaces, state.activeWorkspaceId]);

  /* ─────────────── Mutations ─────────────── */
  const createWorkspace = useCallback(
    (input: { name: string; icon: string }): Workspace | null => {
      if (!user) return null;
      const maxOrder = myWorkspaces.reduce((m, w) => Math.max(m, w.order), -1);
      const workspace: Workspace = {
        id: newId("ws"),
        name: input.name.trim(),
        icon: input.icon || "📁",
        ownerId: user.id,
        order: maxOrder + 1,
        createdAt: new Date(),
      };
      dispatch({ type: "CREATE", payload: workspace });
      return workspace;
    },
    [user, myWorkspaces],
  );

  const updateWorkspace = useCallback<WorkspaceContextValue["updateWorkspace"]>(
    (id, patch) => {
      // Defensive: only update if it belongs to current user.
      const target = state.workspaces.find((w) => w.id === id);
      if (!target || target.ownerId !== user?.id) return;
      dispatch({ type: "UPDATE", payload: { id, patch } });
    },
    [state.workspaces, user],
  );

  const deleteWorkspace = useCallback<WorkspaceContextValue["deleteWorkspace"]>(
    (id) => {
      const target = state.workspaces.find((w) => w.id === id);
      if (!target || target.ownerId !== user?.id) return;
      dispatch({ type: "DELETE", payload: { id } });
      // If we just deleted the active one, snap to the next available.
      if (state.activeWorkspaceId === id) {
        const remaining = myWorkspaces.filter((w) => w.id !== id);
        dispatch({ type: "SET_ACTIVE", payload: { id: remaining[0]?.id ?? null } });
      }
    },
    [state.workspaces, state.activeWorkspaceId, myWorkspaces, user],
  );

  const setActiveWorkspace = useCallback<WorkspaceContextValue["setActiveWorkspace"]>(
    (id) => {
      if (id !== null && !myWorkspaces.some((w) => w.id === id)) return;
      dispatch({ type: "SET_ACTIVE", payload: { id } });
    },
    [myWorkspaces],
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaces: myWorkspaces,
      activeWorkspace,
      isLoading: state.isLoading,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      setActiveWorkspace,
    }),
    [
      myWorkspaces,
      activeWorkspace,
      state.isLoading,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      setActiveWorkspace,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaces(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspaces must be used within <WorkspaceProvider>");
  return ctx;
}
