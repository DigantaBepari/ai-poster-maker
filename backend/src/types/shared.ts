import type { z } from "zod";
import type { layoutSchema } from "../validators/template.validator.js";
export type LayoutConfig = z.infer<typeof layoutSchema>;
