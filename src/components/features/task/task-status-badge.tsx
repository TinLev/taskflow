import { cn } from "@/lib/utils";
import { STATUS_BY_ID } from "@/lib/constants";
import type { TaskStatus } from "@/types";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  size?: "sm" | "md";
  className?: string;
  /** Show colored dot instead of full pill. */
  asDot?: boolean;
}

export function TaskStatusBadge({ status, size = "md", className, asDot }: TaskStatusBadgeProps) {
  const config = STATUS_BY_ID[status];

  if (asDot) {
    return (
      <span
        className={cn("inline-block size-2 shrink-0 rounded-full", config.dotClass, className)}
        aria-label={config.label}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md border font-medium",
        size === "sm" ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs",
        config.badgeClass,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dotClass)} aria-hidden />
      {config.label}
    </span>
  );
}
