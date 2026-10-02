import { apiClient, apiBlob } from "@/lib/apiClient";
import type { Poster, Template } from "@/types/models";
import type { PosterInput, EditableData } from "./poster.schema";
export const createPoster = (body: PosterInput) =>
  apiClient<Poster>("/posters", { method: "POST", body: JSON.stringify(body) });
export const getPoster = (id: string) => apiClient<Poster>("/posters/" + id);
export const listPosters = (userId: string) =>
  apiClient<Poster[]>("/posters/user/" + userId);
export const deletePoster = (id: string) =>
  apiClient<void>("/posters/" + id, { method: "DELETE" });
export const regeneratePoster = (id: string, formData: Partial<EditableData>) =>
  apiClient<Poster>("/posters/" + id + "/regenerate", {
    method: "POST",
    body: JSON.stringify({ formData }),
  });
export const fetchTemplate = (id: string) =>
  apiClient<Template>("/templates/" + id);
export async function uploadPhoto(file: File) {
  const body = new FormData();
  body.append("photoConsent", "true");
  body.append("photo", file);
  return apiClient<{ url: string; publicId: string }>("/upload", {
    method: "POST",
    body,
  });
}
export const downloadPoster = (id: string, format: "png" | "pdf") =>
  apiBlob("/posters/" + id + "/download?format=" + format);
