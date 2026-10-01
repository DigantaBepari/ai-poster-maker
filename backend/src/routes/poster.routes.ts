import { Router } from "express";
import * as c from "../controllers/poster.controller.js";
import { auth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { posterSchema } from "../validators/poster.validator.js";
export const posterRoutes = Router()
  .use(auth)
  .post("/", validate(posterSchema), c.create)
  .get("/user/:userId", c.list)
  .get("/:id", c.get)
  .post("/:id/regenerate", c.regenerate)
  .delete("/:id", c.remove);
