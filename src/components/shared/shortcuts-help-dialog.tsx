"use client";

import { useMemo } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ALL_SHORTCUTS, type Shortcut } from "@/lib/shortcuts";

interface ShortcutsHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutsHelpDialog({ open, onOpenChange }: ShortcutsHelpDialogProps) {
  const grouped = useMemo(() => {
    const map = new Map<Shortcut["category"], Shortcut[]>();
    for (const s of ALL_SHORTCUTS) {
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(s.category, list);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Power-user toolkit. Phím tắt cho thao tác thường dùng nhất.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {grouped.map(([category, items]) => (
            <section key={category}>
              <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                {category}
              </h3>
              <ul className="space-y-1">
                {items.map((s) => (
                  <li
                    key={s.combo}
                    className="hover:bg-secondary/40 -mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm"
                  >
                    <span className="text-foreground">{s.label}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {s.keys.map((key, i) => (
                        <kbd
                          key={i}
                          className="bg-muted border-border/60 text-foreground inline-flex h-6 min-w-6 items-center justify-center rounded border px-1.5 font-mono text-[11px] font-medium shadow-xs"
                        >
                          {key}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
