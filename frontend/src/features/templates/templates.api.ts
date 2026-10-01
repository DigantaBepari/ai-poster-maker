import { apiClient } from "@/lib/apiClient";
import type { Occasion, Template } from "@/types/models";
export const fetchTemplates = (occasion?: Occasion) =>
  apiClient<Template[]>(
    "/templates" + (occasion ? "?occasionType=" + occasion : ""),
  );
