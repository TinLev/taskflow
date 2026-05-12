import type { z } from "zod";
import type { ProjectSchema } from "@/lib/validations";

export type Project = z.infer<typeof ProjectSchema>;
