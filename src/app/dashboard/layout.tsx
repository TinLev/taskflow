import { AuthGuard } from "@/components/features/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ProjectProvider } from "@/contexts/project-context";
import { WorkspaceProvider } from "@/contexts/workspace-context";

/**
 * Dashboard shell — sidebar (desktop) + header + scrollable main.
 *
 * Provider chain: AuthGuard → WorkspaceProvider → ProjectProvider.
 * Workspaces/projects are scoped to the dashboard route only; landing
 * and auth pages don't need them and skip the hydration cost.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <WorkspaceProvider>
        <ProjectProvider>
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
        </ProjectProvider>
      </WorkspaceProvider>
    </AuthGuard>
  );
}
