"use client";

import { LayoutDashboard, Plus, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Treat as active for any path starting with `href` (default true for href !== "/dashboard"). */
  matchPrefix?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, matchPrefix: false },
  { href: "/dashboard/settings", label: "Cài đặt", icon: Settings },
];

interface SidebarProps {
  /** Called when user navigates — used by mobile drawer to auto-close. */
  onNavigate?: () => void;
  /** Apply mobile-styled spacing (no border, full width). */
  mobile?: boolean;
}

/**
 * Sidebar — left navigation. Phase 2 ships a skeleton with the workspace
 * switcher stubbed out; Phase 3 fills it in with real workspaces.
 *
 * Active link detection prefers exact-match for /dashboard (root) and
 * prefix-match for nested routes.
 */
export function Sidebar({ onNavigate, mobile = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "bg-card/30 flex h-full w-full flex-col",
        !mobile && "border-border/60 w-60 border-r",
      )}
    >
      <div className="flex h-14 items-center px-4">
        <Logo />
      </div>
      <Separator />

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active =
              item.matchPrefix === false
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Workspaces placeholder — filled in Phase 3 */}
        <div className="mt-6 px-3">
          <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Workspaces</span>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-5"
              aria-label="Tạo workspace mới"
              disabled
              title="Sẽ có ở Phase 3"
            >
              <Plus className="size-3" />
            </Button>
          </div>
          <div className="bg-muted/40 border-border/60 text-muted-foreground rounded-md border border-dashed px-3 py-4 text-xs">
            <Sparkles className="text-brand mb-1.5 size-3.5" />
            Workspaces & projects sẽ xuất hiện ở Phase 3.
          </div>
        </div>
      </nav>
    </aside>
  );
}
