"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Subtask } from "@/types";

interface SubtaskListProps {
  subtasks: Subtask[];
  onAdd: (title: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

/**
 * SubtaskList — inline checklist with quick-add.
 *
 * Enter in the input adds a subtask; the input clears so the user can
 * keep typing more. Pure controlled component — no internal state for
 * the items themselves; the parent owns mutations.
 */
export function SubtaskList({ subtasks, onAdd, onToggle, onDelete, disabled }: SubtaskListProps) {
  const [draft, setDraft] = useState("");

  function commit() {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
  }

  const done = subtasks.filter((s) => s.completed).length;
  const total = subtasks.length;

  return (
    <div className="space-y-2">
      {total > 0 && (
        <div className="text-muted-foreground text-xs">
          {done}/{total} hoàn thành
          <div className="bg-secondary mt-1 h-1 overflow-hidden rounded-full">
            <div
              className="bg-success h-full transition-all"
              style={{ width: total > 0 ? `${(done / total) * 100}%` : "0%" }}
            />
          </div>
        </div>
      )}

      <ul className="space-y-1">
        {subtasks.map((sub) => (
          <li
            key={sub.id}
            className="group hover:bg-muted/40 -mx-2 flex items-center gap-2 rounded-md px-2 py-1"
          >
            <Checkbox
              id={`st-${sub.id}`}
              checked={sub.completed}
              onCheckedChange={() => onToggle(sub.id)}
              disabled={disabled}
            />
            <label
              htmlFor={`st-${sub.id}`}
              className={cn(
                "flex-1 cursor-pointer text-sm select-none",
                sub.completed && "text-muted-foreground line-through",
              )}
            >
              {sub.title}
            </label>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(sub.id)}
              disabled={disabled}
              className="text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
              aria-label={`Xóa subtask "${sub.title}"`}
            >
              <Trash2 className="size-3" />
            </Button>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Thêm subtask... (Enter)"
          disabled={disabled}
          className="h-8 text-sm"
        />
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={commit}
          disabled={disabled || !draft.trim()}
          aria-label="Thêm subtask"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
