import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  /** Centered full-screen overlay variant */
  fullScreen?: boolean;
  label?: string;
}

/**
 * LoadingSpinner — small (default 16px) or full-screen.
 * `aria-live="polite"` so screen readers announce when content
 * is loading, but only when label is provided.
 */
export function LoadingSpinner({ className, fullScreen, label }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div
        className="bg-background/60 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
          {label && <p className="text-muted-foreground text-sm">{label}</p>}
        </div>
      </div>
    );
  }

  return (
    <Loader2
      className={cn("text-muted-foreground size-4 animate-spin", className)}
      role={label ? "status" : undefined}
      aria-label={label}
    />
  );
}
