"use client";

import { Plus, Search } from "lucide-react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Header — top bar inside the dashboard shell.
 *
 * Layout:
 *  - Left: mobile menu button (md:hidden) + search input
 *  - Right: quick-create + theme toggle + user menu
 *
 * Search & quick-create are placeholders; Phase 4 wires them to real
 * task actions + the command palette.
 */
export function Header() {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-20 flex h-14 items-center gap-2 border-b px-3 backdrop-blur sm:px-4">
      <MobileNav />

      <div className="relative max-w-md flex-1">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Tìm task, project... (⌘K)"
          aria-label="Search"
          className="bg-secondary/40 h-9 pl-9"
          disabled
          title="Phase 4 sẽ kích hoạt search"
        />
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="hidden gap-1.5 sm:inline-flex"
          disabled
          title="Phase 4 sẽ kích hoạt quick-create"
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
