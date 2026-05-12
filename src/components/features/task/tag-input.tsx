"use client";

import { X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * TagInput — chip-style multi-input. Press Enter or comma to commit a tag;
 * Backspace on empty input removes the last chip.
 */
export function TagInput({
  value,
  onChange,
  placeholder = "Thêm tag... (Enter)",
  disabled,
  className,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const trimmed = raw.trim().replace(/,$/, "");
    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && draft.length === 0 && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div
      className={cn(
        "border-input focus-within:ring-ring/50 focus-within:border-ring flex flex-wrap items-center gap-1 rounded-md border bg-transparent px-2 py-1.5 text-sm transition-all focus-within:ring-[3px]",
        disabled && "opacity-50",
        className,
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Xóa tag ${tag}`}
            >
              <X className="size-3" />
            </button>
          )}
        </span>
      ))}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commit(draft)}
        placeholder={value.length === 0 ? placeholder : ""}
        disabled={disabled}
        className="h-6 min-w-[8ch] flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
