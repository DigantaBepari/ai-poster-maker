import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { upload as multer } from "../middleware/upload.js";
import { upload } from "../controllers/upload.controller.js";
export const uploadRoutes = Router().post(
  "/",
  auth,
  multer.single("photo"),
  upload,
);
