import { Router } from "express";
import * as c from "../controllers/template.controller.js";
export const templateRoutes = Router().get("/", c.list).get("/:id", c.get);
