import { AuthGuard } from "@/components/features/auth/auth-guard";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

/**
 * Dashboard shell — sidebar (desktop) + header + scrollable main.
 *
 * `AuthGuard` is the only client boundary here; the rest of this file
 * is a server component, so Sidebar/Header are still SSR'd into HTML
 * and only hydrate the interactive pieces.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
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
    </AuthGuard>
  );
}
