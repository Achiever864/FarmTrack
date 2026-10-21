import Farm from "../models/farm.model.js";
import Observation from "../models/observation.model.js";
import Alert from "../models/alert.model.js";
import Organization from "../models/organization.model.js";
import Membership from "../models/membership.model.js";
import { computeFarmHealth } from "../services/analysis/health.service.js";
import { computePhenology } from "../services/analysis/phenology.service.js";
import { generateFarmAdvisory, chatWithAi } from "../services/ai.service.js";
import { buildUserRagContext } from "../services/rag.service.js";

async function userCanAccessFarm(userId, farm) {
  if (farm.ownerType === "user") {
    return farm.ownerId.toString() === userId.toString();
  }
  const org = await Organization.findById(farm.orgId);
  if (!org) return false;
  if (org.ownerId.toString() === userId.toString()) return true;
  const mem = await Membership.findOne({ orgId: farm.orgId, userId, status: "active" });
  return !!mem;
}

/**
 * Generates an in-depth AI agronomic diagnostic advisory grounded in a farm's satellite telemetry
 */
export async function getFarmAiAdvisory(req, res) {
  try {
    const { id } = req.params;
    const { query } = req.body || {};

    const farm = await Farm.findById(id);
    if (!farm) return res.status(404).json({ error: "Farm not found" });

    const authorized = await userCanAccessFarm(req.user._id, farm);
    if (!authorized) return res.status(403).json({ error: "Access denied" });

    const observations = await Observation.find({ farmId: farm._id })
      .sort({ obsDate: 1 })
      .lean();

    const health = await computeFarmHealth(farm, observations);
    const phenology = computePhenology(farm, observations);
    const alerts = await Alert.find({ farmId: farm._id, resolvedAt: null }).sort({ createdAt: -1 });

    const advisory = await generateFarmAdvisory({
      farm,
      observations,
      health,
      phenology,
      alerts,
      userQuery: query,
    });

    res.json({
      farmId: farm._id,
      farmName: farm.name,
      advisory,
      generatedAt: new Date(),
    });
  } catch (err) {
    console.error("[AI Controller] Advisory error:", err);
    res.status(500).json({ error: err.message || "Failed to generate AI advisory" });
  }
}

/**
 * Handles conversational queries with the FarmTrack AI Agronomist Copilot
 * grounded in real-time RAG context from the user's registered farms in MongoDB
 */
export async function handleAiChat(req, res) {
  try {
    const { messages, farmId, orgId } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Extract latest user message for search query grounding
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const userQuery = lastUserMsg?.content || "";

    // 1. Execute RAG: Retrieve user's registered farms, latest observations, and active alerts from MongoDB
    const ragContext = await buildUserRagContext(req.user._id, {
      farmId: farmId || null,
      orgId: orgId || null,
      userQuery,
    });

    let farmContext = null;
    let orgContext = null;

    if (farmId) {
      const farm = await Farm.findById(farmId);
      if (farm && (await userCanAccessFarm(req.user._id, farm))) {
        farmContext = farm;
      }
    }

    if (orgId) {
      const org = await Organization.findById(orgId);
      if (org) {
        const farmCount = await Farm.countDocuments({ orgId, ownerType: "organization" });
        orgContext = {
          name: org.name,
          stats: { totalFarms: farmCount },
        };
      }
    }

    const reply = await chatWithAi({
      messages,
      ragContext,
      farmContext,
      orgContext,
    });

    res.json({
      reply,
      ragMetadata: {
        totalFarms: ragContext.totalFarms,
        strugglingCount: ragContext.strugglingCount,
        healthyCount: ragContext.healthyCount,
        focusedFarm: ragContext.focusedFarm?.name || null,
      },
    });
  } catch (err) {
    console.error("[AI Controller] Chat error:", err);
    res.status(500).json({ error: err.message || "Failed to process AI chat message" });
  }
}
