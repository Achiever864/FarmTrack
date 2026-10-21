import Farm from "../models/farm.model.js";
import Observation from "../models/observation.model.js";
import Alert from "../models/alert.model.js";
import Organization from "../models/organization.model.js";
import Membership from "../models/membership.model.js";
import { computeFarmHealth } from "./analysis/health.service.js";
import { computePhenology } from "./analysis/phenology.service.js";

/**
 * Builds a real-time Retrieval-Augmented Generation (RAG) agronomic context
 * directly from the authenticated user's MongoDB farm registry, multispectral
 * Sentinel-2 observations, and active alerts.
 */
export async function buildUserRagContext(userId, { farmId = null, orgId = null, userQuery = "" } = {}) {
  // 1. Discover all organizations user has access to
  const ownedOrgs = await Organization.find({ ownerId: userId }).lean();
  const memberships = await Membership.find({ userId, status: "active" }).lean();
  const orgMap = new Map();
  ownedOrgs.forEach((o) => orgMap.set(o._id.toString(), o.name));
  
  if (memberships.length > 0) {
    const memberOrgDocs = await Organization.find({
      _id: { $in: memberships.map((m) => m.orgId) },
    }).lean();
    memberOrgDocs.forEach((o) => orgMap.set(o._id.toString(), o.name));
  }
  const accessibleOrgIds = Array.from(orgMap.keys());

  // 2. Query all farms accessible to the user
  let farmFilter = {};
  if (orgId) {
    farmFilter = { orgId, ownerType: "organization" };
  } else {
    farmFilter = {
      $or: [
        { ownerId: userId, ownerType: "user" },
        ...(accessibleOrgIds.length > 0
          ? [{ orgId: { $in: accessibleOrgIds }, ownerType: "organization" }]
          : []),
      ],
    };
  }

  const farms = await Farm.find(farmFilter).sort({ createdAt: -1 }).lean();

  if (farms.length === 0) {
    return {
      totalFarms: 0,
      farms: [],
      strugglingFarms: [],
      healthyFarms: [],
      ragPromptText: `
=== USER DATABASE REGISTRY (RAG CONTEXT) ===
Status: The user currently has 0 registered farms in their FarmTrack database.
Instructions for AI:
- Acknowledge that you checked their account and found no farms saved yet.
- Explain how they can add their first cocoa farm (by drawing its boundary polygon on the interactive satellite map or using the GPS perimeter walk feature).
- Offer general cocoa agronomic guidance if they have broad questions about West African cocoa management.
`,
    };
  }

  const farmIds = farms.map((f) => f._id);

  // 3. Batch query unresolved alerts for all these farms
  const activeAlerts = await Alert.find({ farmId: { $in: farmIds }, resolvedAt: null })
    .sort({ createdAt: -1 })
    .lean();

  const alertsByFarm = {};
  activeAlerts.forEach((a) => {
    const fid = a.farmId.toString();
    if (!alertsByFarm[fid]) alertsByFarm[fid] = [];
    alertsByFarm[fid].push(a);
  });

  // 4. Batch query latest observation for each farm
  const latestObsByFarm = {};
  for (const f of farms) {
    const fid = f._id.toString();
    const latestObs = await Observation.findOne({ farmId: f._id })
      .sort({ obsDate: -1 })
      .lean();
    if (latestObs) {
      latestObsByFarm[fid] = latestObs;
    }
  }

  // 5. Categorize struggling vs healthy farms
  const strugglingFarms = [];
  const healthyFarms = [];

  farms.forEach((f) => {
    const fid = f._id.toString();
    const fAlerts = alertsByFarm[fid] || [];
    const latestObs = latestObsByFarm[fid] || null;
    const healthStatus = f.latestHealth?.status || "insufficient_data";
    const healthScore = f.latestHealth?.score != null ? f.latestHealth.score : null;

    const isStruggling =
      healthStatus === "stress" ||
      healthStatus === "drought" ||
      healthStatus === "decline" ||
      healthStatus === "patchy" ||
      healthStatus === "at_risk" ||
      healthStatus === "watch" ||
      (healthScore !== null && healthScore < 70) ||
      fAlerts.length > 0 ||
      (latestObs && (latestObs.ndviMean < 0.60 || latestObs.ndreMean < 0.35 || latestObs.ndmiMean < 0.15));

    const farmData = {
      ...f,
      alerts: fAlerts,
      latestObservation: latestObs,
      isStruggling,
    };

    if (isStruggling) {
      strugglingFarms.push(farmData);
    } else {
      healthyFarms.push(farmData);
    }
  });

  // 6. Check if a specific farm is targeted (by farmId or name in userQuery)
  let focusedFarm = null;
  let focusedFarmRecentObs = [];
  let focusedPhenology = null;

  if (farmId) {
    focusedFarm = farms.find((f) => f._id.toString() === farmId.toString());
  } else if (userQuery) {
    const queryLower = userQuery.toLowerCase();
    focusedFarm = farms.find((f) => queryLower.includes(f.name.toLowerCase()));
  }

  if (focusedFarm) {
    focusedFarmRecentObs = await Observation.find({ farmId: focusedFarm._id })
      .sort({ obsDate: 1 })
      .lean();
    if (focusedFarmRecentObs.length > 10) {
      focusedFarmRecentObs = focusedFarmRecentObs.slice(-10);
    }
    focusedPhenology = computePhenology(focusedFarm, focusedFarmRecentObs);
  }

  // 7. Format RAG prompt representation
  const formatFarmDetail = (f) => {
    const fid = f._id.toString();
    const alerts = alertsByFarm[fid] || [];
    const obs = latestObsByFarm[fid];
    const orgName = f.orgId ? orgMap.get(f.orgId.toString()) : null;

    let text = `
* FARM: "${f.name}" (ID: ${f._id})
  - Ownership: ${orgName ? `Organization "${orgName}"` : "Personal Account"}
  - Crop: ${f.cropType || "Cocoa"}${f.treeAgeYears ? ` (${f.treeAgeYears} yrs old)` : ""}
  - Area: ${f.areaHa ? `${f.areaHa.toFixed(2)} ha` : "N/A"}
  - Region/Tags: ${f.tags?.join(", ") || "General West Africa Cocoa Belt"}
  - Health Status: ${f.latestHealth?.status?.toUpperCase() || "PENDING"} (Score: ${f.latestHealth?.score != null ? `${f.latestHealth.score}/100` : "Calculating"})
  - Confidence: ${f.latestHealth?.confidence || "medium"}`;

    if (f.latestHealth?.reasons && f.latestHealth.reasons.length > 0) {
      text += `\n  - Algorithmic Notes: ${f.latestHealth.reasons.join("; ")}`;
    }

    if (obs) {
      text += `\n  - Latest Sentinel-2 Radiometry (${new Date(obs.obsDate).toISOString().slice(0, 10)}):
    • NDVI (Biomass / Canopy Vigor): ${obs.ndviMean != null ? obs.ndviMean.toFixed(4) : "N/A"} (Healthy Cocoa Threshold: 0.65 - 0.85)
    • NDRE (Red Edge Chlorophyll): ${obs.ndreMean != null ? obs.ndreMean.toFixed(4) : "N/A"} (Healthy Threshold: >0.38)
    • NDMI (Canopy Moisture): ${obs.ndmiMean != null ? obs.ndmiMean.toFixed(4) : "N/A"} (Healthy Threshold: >0.20)
    • Clear Pixels: ${obs.validPixels || "N/A"} / ${obs.totalPixels || "N/A"}`;
    } else {
      text += `\n  - Latest Radiometry: Backfill in progress or no cloud-free images yet.`;
    }

    if (alerts.length > 0) {
      text += `\n  - ACTIVE UNRESOLVED ALERTS (${alerts.length}):`;
      alerts.forEach((a) => {
        text += `\n    ⚠️ [${a.severity?.toUpperCase()}] ${a.type.toUpperCase()}: ${a.message} (Triggered: ${new Date(a.createdAt).toISOString().slice(0, 10)})`;
      });
    } else {
      text += `\n  - Active Alerts: None (Stable)`;
    }

    return text;
  };

  const totalArea = farms.reduce((sum, f) => sum + (f.areaHa || 0), 0);

  const ragPromptText = `
======================================================================
GROUND TRUTH DATABASE REGISTRY (REAL-TIME RAG CONTEXT FROM USER'S ACCOUNT)
======================================================================
User Account: ${userId}
Total Registered Farms in Database: ${farms.length} (${totalArea.toFixed(2)} total hectares)
Overview:
- Struggling / At-Risk Farms: ${strugglingFarms.length}
- Healthy / Thriving Farms: ${healthyFarms.length}

${
  strugglingFarms.length > 0
    ? `🚨 STRUGGLING / AT-RISK FARMS REQUIRING AGRONOMIC INTERVENTION (${strugglingFarms.length}):
${strugglingFarms.map(formatFarmDetail).join("\n")}`
    : `✅ NO FARMS ARE STRUGGLING: All ${farms.length} registered farms have healthy scores (>=70) and zero active alerts.`
}

${
  healthyFarms.length > 0
    ? `🌿 HEALTHY & STABLE FARMS (${healthyFarms.length}):
${healthyFarms.map(formatFarmDetail).join("\n")}`
    : ""
}

${
  focusedFarm
    ? `🎯 IN-FOCUS FARM DEEP TELEMETRY ("${focusedFarm.name}"):
- Phenology Stage: ${focusedPhenology?.maturityStage || "N/A"} (${focusedPhenology?.maturityLabel || ""})
- Current Season: ${focusedPhenology?.currentSeason?.name || "Active Crop Season"}
- 20-Day Trend: ${focusedPhenology?.trend?.direction?.toUpperCase() || "STABLE"} (Slope: ${focusedPhenology?.trend?.slope?.toFixed(5) || "0"})
- Recent Observation History (Last ${focusedFarmRecentObs.length} dates):
${focusedFarmRecentObs
  .map(
    (o) =>
      `  • ${new Date(o.obsDate).toISOString().slice(0, 10)}: NDVI=${o.ndviMean?.toFixed(3)}, NDRE=${o.ndreMean?.toFixed(3)}, NDMI=${o.ndmiMean?.toFixed(3)}`
  )
  .join("\n")}`
    : ""
}
======================================================================
CRITICAL GROUNDED INSTRUCTIONS FOR GEMINI AI:
1. YOU HAVE LIVE ACCESS TO THE USER'S FARM REGISTRY AND SATELLITE TELEMETRY ABOVE.
2. NEVER ASK THE USER TO PASTE THEIR FARM TELEMETRY OR STATE "I don't have your specific farm registry loaded in this chat yet"! Their actual data is right here in your context.
3. If the user asks "which of my farms are not doing well?", "which farms are struggling?", "how are my farms doing?", or similar questions:
   - If there are struggling farms listed above (${strugglingFarms.length}):
     • Explicitly name each struggling farm immediately.
     • Cite its exact current status, health score out of 100, and latest Sentinel-2 telemetry values (NDVI, NDRE, NDMI).
     • Explain precisely why it is flagged (e.g., chlorophyll loss shown by low NDRE, moisture deficit during Harmattan shown by low NDMI, canopy thinning shown by NDVI drop, or active alerts).
     • Give a concrete, prioritized 14-day field intervention plan tailored to those exact farms.
   - If there are NO struggling farms:
     • Clearly confirm that all ${farms.length} of their farms are in good health.
     • List each farm by name with its health score and NDVI vigor.
4. Always address the user with agronomic confidence, referencing their actual farm names and data accurately.
`;

  return {
    totalFarms: farms.length,
    totalAreaHa: totalArea,
    strugglingCount: strugglingFarms.length,
    healthyCount: healthyFarms.length,
    strugglingFarms,
    healthyFarms,
    focusedFarm,
    ragPromptText,
  };
}
