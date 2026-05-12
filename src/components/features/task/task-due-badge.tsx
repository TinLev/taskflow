import { differenceInCalendarDays, format, isToday, isTomorrow, isYesterday } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarClock } from "lucide-react";

import { cn } from "@/lib/utils";

interface TaskDueBadgeProps {
  dueDate: Date | string;
  /** If the task is done, dim the badge (Done items shouldn't scream overdue). */
  muted?: boolean;
  className?: string;
}

/**
 * TaskDueBadge — colored chip showing relative due date.
 *
 *  - Overdue → destructive (red)
 *  - Today → warning (amber)
 *  - Tomorrow → info (blue)
 *  - Within 7 days → default
 *  - Beyond → muted
 *
 * Falls back to "dd MMM" for distant dates.
 */
export function TaskDueBadge({ dueDate, muted, className }: TaskDueBadgeProps) {
  const date = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const diff = differenceInCalendarDays(date, new Date());

  let label: string;
  if (isToday(date)) label = "Hôm nay";
  else if (isTomorrow(date)) label = "Ngày mai";
  else if (isYesterday(date)) label = "Hôm qua";
  else if (diff < 0) label = `Quá hạn ${Math.abs(diff)}d`;
  else if (diff <= 7) label = `${diff} ngày nữa`;
  else label = format(date, "dd MMM", { locale: vi });

  const tone =
    muted || diff > 7
      ? "text-muted-foreground border-border bg-muted/40"
      : diff < 0
        ? "text-destructive border-destructive/30 bg-destructive/10"
        : isToday(date)
          ? "text-warning border-warning/30 bg-warning/10"
          : isTomorrow(date)
            ? "text-info border-info/30 bg-info/10"
            : "text-foreground border-border bg-secondary/40";

  return (
    <span
      title={format(date, "EEEE, dd MMMM yyyy", { locale: vi })}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
        tone,
        className,
      )}
    >
      <CalendarClock className="size-3" />
      {label}
    </span>
  );
}
