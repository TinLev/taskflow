"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useAuth } from "@/contexts/auth-context";

/**
 * AuthGuard — client-side protected wrapper.
 *
 * Behavior:
 *  - While auth state is loading (initial localStorage hydration), shows
 *    a full-screen spinner. This is a single-tick wait, not a network call.
 *  - If unauthenticated after hydration, redirects to /login.
 *  - Otherwise renders children.
 *
 * Why not middleware?
 *  - Auth state lives in localStorage, which middleware (running on the
 *    edge) can't read. A real backend would use HTTP-only cookies +
 *    middleware. For this demo, client-side guard is sufficient.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Đang tải..." />;
  }

  if (!isAuthenticated) {
    // Render nothing during the brief moment before redirect — avoids
    // flashing protected content to logged-out users.
    return null;
  }

  return <>{children}</>;
}
