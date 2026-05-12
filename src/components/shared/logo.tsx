import { ListTodo } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** If true, renders as plain markup (no link wrapper) */
  noLink?: boolean;
  /** Hide the wordmark, show only the icon */
  iconOnly?: boolean;
}

/**
 * Logo — TaskFlow brand mark. Renders an indigo gradient tile with the
 * task icon and the "TaskFlow" wordmark next to it.
 *
 * Use `noLink` inside places that already wrap navigation (e.g. inside
 * a custom <a>), to avoid nesting links (invalid HTML).
 */
export function Logo({ className, noLink, iconOnly }: LogoProps) {
  const content = (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="from-brand to-brand/70 inline-flex size-8 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm">
        <ListTodo className="size-5" strokeWidth={2.5} />
      </span>
      {!iconOnly && <span className="text-lg font-semibold tracking-tight">TaskFlow</span>}
    </span>
  );

  if (noLink) return content;

  return (
    <Link
      href="/"
      className="focus-visible:ring-ring rounded-md focus-visible:ring-2 focus-visible:outline-none"
    >
      {content}
    </Link>
  );
}
