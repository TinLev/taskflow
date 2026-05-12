"use client";

import { Plus, Search } from "lucide-react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

/**
 * Header — top bar inside the dashboard shell.
 *
 * Layout:
 *  - Left: mobile menu button (md:hidden) + command palette trigger
 *  - Right: quick-create (also opens palette) + theme toggle + user menu
 *
 * The "Search..." button is a thin trigger for the global Command
 * Palette mounted in DashboardLayout. We dispatch a window event so
 * the palette doesn't need to be lifted into a Context.
 */
function openPalette(query?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("taskflow:open-palette", { detail: { query } }));
}

export function Header() {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-20 flex h-14 items-center gap-2 border-b px-3 backdrop-blur sm:px-4">
      <MobileNav />

      <button
        type="button"
        onClick={() => openPalette()}
        className="bg-secondary/40 hover:bg-secondary/60 border-border/60 text-muted-foreground flex h-9 max-w-md flex-1 items-center gap-2 rounded-md border px-3 text-sm transition-colors"
        aria-label="Mở command palette"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left">Tìm hoặc tạo... </span>
        <span className="bg-background border-border/60 hidden rounded border px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">
          ⌘K
        </span>
      </button>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="hidden gap-1.5 sm:inline-flex"
          onClick={() => openPalette("task")}
        >
          <Plus className="size-4" />
          Task mới
        </Button>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
