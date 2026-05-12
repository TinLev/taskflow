import type { z } from "zod";
import type { WorkspaceSchema } from "@/lib/validations";

export type Workspace = z.infer<typeof WorkspaceSchema>;
