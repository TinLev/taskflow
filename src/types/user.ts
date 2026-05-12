import type { z } from "zod";
import type { UserSchema } from "@/lib/validations";

export type User = z.infer<typeof UserSchema>;
