import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadPhoto } from "../services/upload.service.js";
export const upload = asyncHandler(async (req, res) => {
  res
    .status(201)
    .json(await uploadPhoto(req.file, req.user!.id, req.body?.photoConsent));
});
