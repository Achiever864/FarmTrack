import { Router } from "express";
import { getFarmAiAdvisory, handleAiChat } from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all AI endpoints with JWT authentication
router.use(authenticate);

// Generate deep farm advisory
router.post("/farm-advisory/:id", getFarmAiAdvisory);

// Conversational AI Copilot Chat
router.post("/chat", handleAiChat);

export default router;
