import { Router } from "express";
import {
  createFarm,
  getFarms,
  getFarmById,
  updateFarm,
  deleteFarm,
  getFarmTimeseries,
  getFarmAnalysis,
  bulkImportFarms,
} from "../controllers/farm.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all farm routes with JWT authentication
router.use(authenticate);

router.post("/", createFarm);
router.get("/", getFarms);
router.post("/import", bulkImportFarms);
router.get("/:id", getFarmById);
router.patch("/:id", updateFarm);
router.delete("/:id", deleteFarm);
router.get("/:id/timeseries", getFarmTimeseries);
router.get("/:id/analysis", getFarmAnalysis);

export default router;
