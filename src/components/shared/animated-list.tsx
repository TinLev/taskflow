"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay between siblings, in seconds. Default 0.04 (~40ms). */
  stagger?: number;
}

/**
 * AnimatedList — fade + rise children into view with a stagger.
 *
 * Use sparingly — only on first-paint surfaces (dashboard stat cards,
 * workspace grid, etc). Don't wrap kanban columns: @dnd-kit's transform
 * already manages position, and framer-motion's `layout` prop on the
 * same element fights it.
 */
export function AnimatedList({ children, className, stagger = 0.04 }: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedItemProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedItem({ children, className }: AnimatedItemProps) {
  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
      }}
    >
      {children}
    </motion.div>
  );
}
