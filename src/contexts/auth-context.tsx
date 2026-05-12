"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { DEMO_USER } from "@/data/mock-data";
import { DEMO_CREDENTIALS, STORAGE_KEYS } from "@/lib/constants";
import { newId } from "@/lib/id";
import { safeStorage } from "@/lib/storage";
import {
  StoredUsersSchema,
  UserSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validations";
import type { User } from "@/types";

interface StoredUser {
  user: User;
  password: string;
}

type AuthResult = { ok: true } | { ok: false; error: string };

interface AuthContextValue {
  user: User | null;
  /** True while we're hydrating from localStorage on the initial mount. */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<AuthResult>;
  register: (input: Omit<RegisterInput, "confirmPassword">) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Make sure the demo account exists in the users store.
 * Called once on mount — idempotent (checks before inserting).
 *
 * Why seed in the client?
 *  - This app has no backend; localStorage is the source of truth.
 *  - Without seeding, recruiters couldn't log in with the demo creds
 *    advertised in the README until they'd registered.
 */
function ensureDemoUserSeeded(): StoredUser[] {
  const existing = safeStorage.get<StoredUser[]>(STORAGE_KEYS.USERS, StoredUsersSchema, []);
  if (existing.some((u) => u.user.email === DEMO_CREDENTIALS.email)) return existing;

  const seeded: StoredUser[] = [
    ...existing,
    { user: DEMO_USER, password: DEMO_CREDENTIALS.password },
  ];
  safeStorage.set(STORAGE_KEYS.USERS, seeded);
  return seeded;
}

/**
 * AuthProvider — owns the "current user" session.
 *
 * State machine:
 *  - On mount: `isLoading=true`. Read session from localStorage, then
 *    set `isLoading=false` regardless of result. This 2-tick pattern
 *    avoids the dreaded "logged out flash" when reloading authenticated
 *    pages.
 *  - login / register: simulate ~200ms latency so the UI's loading
 *    state is visible to the user (real backends will replace this).
 *  - logout: clear session + redirect to /login.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ensureDemoUserSeeded();
    const session = safeStorage.get<User | null>(STORAGE_KEYS.USER, UserSchema, null);
    // One-time hydration from localStorage on mount. The eslint
    // "set-state-in-effect" rule targets derived-state misuse and
    // doesn't fit this legitimate external-sync case (server cannot
    // read localStorage, so we must defer this until after mount).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(session);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (input: LoginInput): Promise<AuthResult> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const users = safeStorage.get<StoredUser[]>(STORAGE_KEYS.USERS, StoredUsersSchema, []);
    const match = users.find(
      (u) =>
        u.user.email.toLowerCase() === input.email.toLowerCase() && u.password === input.password,
    );

    if (!match) {
      return { ok: false, error: "Email hoặc mật khẩu không đúng" };
    }

    safeStorage.set(STORAGE_KEYS.USER, match.user);
    setUser(match.user);
    return { ok: true };
  }, []);

  const register = useCallback(
    async (input: Omit<RegisterInput, "confirmPassword">): Promise<AuthResult> => {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const users = safeStorage.get<StoredUser[]>(STORAGE_KEYS.USERS, StoredUsersSchema, []);
      if (users.some((u) => u.user.email.toLowerCase() === input.email.toLowerCase())) {
        return { ok: false, error: "Email này đã được đăng ký" };
      }

      const newUser: User = {
        id: newId("user"),
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        createdAt: new Date(),
      };
      const next: StoredUser[] = [...users, { user: newUser, password: input.password }];
      safeStorage.set(STORAGE_KEYS.USERS, next);
      safeStorage.set(STORAGE_KEYS.USER, newUser);
      setUser(newUser);
      return { ok: true };
    },
    [],
  );

  const logout = useCallback(() => {
    safeStorage.remove(STORAGE_KEYS.USER);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — access the current auth state.
 * Throws if called outside an AuthProvider (catches setup bugs early).
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
