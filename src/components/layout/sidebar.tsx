"use client";

import { LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ProjectList } from "@/components/features/project/project-list";
import { WorkspaceSwitcher } from "@/components/features/workspace/workspace-switcher";
import { Logo } from "@/components/shared/logo";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  matchPrefix?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, matchPrefix: false },
  { href: "/dashboard/settings", label: "Cài đặt", icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
  mobile?: boolean;
}

export function Sidebar({ onNavigate, mobile = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "bg-card/30 flex h-full w-full flex-col",
        !mobile && "border-border/60 w-64 border-r",
      )}
    >
      {/* Top: Logo (desktop only — mobile sheet already has header) */}
      {!mobile && (
        <>
          <div className="flex h-14 items-center px-4">
            <Logo />
          </div>
          <Separator />
        </>
      )}

      {/* Workspace switcher */}
      <div className="border-border/60 border-b px-2 py-3">
        <WorkspaceSwitcher />
      </div>

      {/* Primary nav */}
      <nav className="px-2 py-2">
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
      </nav>

      <Separator />

      {/* Projects of active workspace */}
      <div className="min-h-0 flex-1 overflow-hidden px-2 py-3">
        <ProjectList onNavigate={onNavigate} />
      </div>
    </aside>
  );
}
