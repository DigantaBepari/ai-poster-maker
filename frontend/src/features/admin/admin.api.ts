import { apiClient } from "@/lib/apiClient";
import type { Template, Poster } from "@/types/models";
export const getAdminTemplates = () =>
  apiClient<Template[]>("/admin/templates");
export const getAdminPosters = () => apiClient<Poster[]>("/admin/posters");
export const saveTemplate = (body: Omit<Template, "_id">, id?: string) =>
  apiClient<Template>("/admin/templates" + (id ? "/" + id : ""), {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify(body),
  });
export const toggleTemplate = (id: string, isActive: boolean) =>
  apiClient<Template>("/admin/templates/" + id, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
export const flagPoster = (id: string, flagged: boolean) =>
  apiClient<Poster>("/admin/posters/" + id + "/flag", {
    method: "PATCH",
    body: JSON.stringify({ flagged }),
  });
