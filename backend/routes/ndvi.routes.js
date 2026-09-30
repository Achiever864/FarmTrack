import { Router } from "express";
import { getNdvi } from "../controllers/ndvi.controller.js";

const router = Router();
router.get("/", getNdvi);
export default router;