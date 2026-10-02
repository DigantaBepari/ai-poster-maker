import { Template } from "../models/Template.js";
import { ApiError } from "../utils/ApiError.js";
import {
  occasionQuery,
  templateSchema,
  templatePatchSchema,
} from "../validators/template.validator.js";
export const listTemplates = (query: unknown) =>
  Template.find({ isActive: true, ...occasionQuery.parse(query) }).sort({
    createdAt: -1,
  });
export async function getTemplate(id: string) {
  const t = await Template.findOne({ _id: id, isActive: true });
  if (!t) throw new ApiError(404, "NOT_FOUND", "Template not found");
  return t;
}
export const createTemplate = (body: unknown) =>
  Template.create(templateSchema.parse(body));
export async function updateTemplate(id: string, body: unknown) {
  const t = await Template.findByIdAndUpdate(
    id,
    { $set: templatePatchSchema.parse(body) },
    { new: true, runValidators: true },
  );
  if (!t) throw new ApiError(404, "NOT_FOUND", "Template not found");
  return t;
}
export async function deleteTemplate(id: string) {
  const t = await Template.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );
  if (!t) throw new ApiError(404, "NOT_FOUND", "Template not found");
  return t;
}

export const adminTemplates = () => Template.find().sort({ createdAt: -1 });
