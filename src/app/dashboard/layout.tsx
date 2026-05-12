import { AuthGuard } from "@/components/features/auth/auth-guard";
import { CommandPalette } from "@/components/features/command-palette/command-palette";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ProjectProvider } from "@/contexts/project-context";
import { TaskProvider } from "@/contexts/task-context";
import { WorkspaceProvider } from "@/contexts/workspace-context";

/**
 * Dashboard shell — sidebar (desktop) + header + scrollable main.
 *
 * Provider chain (top-down dependencies):
 *   AuthGuard → WorkspaceProvider → ProjectProvider → TaskProvider
 *
 * Tasks belong to projects which belong to workspaces, so the provider
 * order matches the ownership chain. Each layer waits for its parent's
 * loading state before reading / seeding its own slice of localStorage.
 *
 * These providers are mounted only on dashboard routes — landing/auth
 * pages don't need them and skip the hydration cost.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <WorkspaceProvider>
        <ProjectProvider>
          <TaskProvider>
            <div className="bg-background flex h-screen overflow-hidden">
              <div className="hidden md:flex">
                <Sidebar />
              </div>
              <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto">
                  <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
                </main>
              </div>
            </div>
            {/* Global ⌘K + ⌘N + ⌘/ launcher — must live inside every
                provider it queries (auth, workspaces, projects). */}
            <CommandPalette />
          </TaskProvider>
        </ProjectProvider>
      </WorkspaceProvider>
    </AuthGuard>
  );
}
