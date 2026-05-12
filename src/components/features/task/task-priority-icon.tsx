import { ArrowDown, ArrowUp, Equal, Flame } from "lucide-react";

import { PRIORITY_BY_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/types";

const PRIORITY_ICONS = {
  low: ArrowDown,
  medium: Equal,
  high: ArrowUp,
  urgent: Flame,
} as const;

interface TaskPriorityIconProps {
  priority: TaskPriority;
  className?: string;
  /** Show label next to icon. */
  showLabel?: boolean;
}

export function TaskPriorityIcon({ priority, className, showLabel }: TaskPriorityIconProps) {
  const config = PRIORITY_BY_ID[priority];
  const Icon = PRIORITY_ICONS[priority];

  if (showLabel) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
          config.badgeClass,
          className,
        )}
      >
        <Icon className="size-3" />
        {config.label}
      </span>
    );
  }

  return (
    <Icon
      className={cn("size-3.5 shrink-0", config.iconClass, className)}
      aria-label={`Priority: ${config.label}`}
    />
  );
}
