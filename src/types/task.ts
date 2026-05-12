import type { z } from "zod";
import type {
  SubtaskSchema,
  TaskPrioritySchema,
  TaskSchema,
  TaskStatusSchema,
} from "@/lib/validations";

export type Task = z.infer<typeof TaskSchema>;
export type Subtask = z.infer<typeof SubtaskSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
