import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import { flagSchema } from "../validators/poster.validator.js";
import {
  templateSchema,
  templatePatchSchema,
} from "../validators/template.validator.js";
import * as t from "../controllers/template.controller.js";
import * as p from "../controllers/poster.controller.js";
export const adminRoutes = Router()
  .use(auth, requireAdmin)
  .get("/templates", t.adminList)
  .post("/templates", validate(templateSchema), t.create)
  .patch("/templates/:id", validate(templatePatchSchema), t.update)
  .delete("/templates/:id", t.remove)
  .get("/posters", p.adminList)
  .patch("/posters/:id/flag", validate(flagSchema), p.flag);
