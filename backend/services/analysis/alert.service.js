import Alert from "../../models/alert.model.js";
import { getCropProfile } from "./cropProfiles.js";

/**
 * Checks observation history and health analysis, creates new alerts if conditions warrant,
 * and auto-resolves alerts when conditions recover. Avoids duplicates.
 *
 * @param {Object} farm
 * @param {Array} observations (chronological)
 * @param {Object} healthResult { status, score, reasons }
 */
export async function evaluateAndSyncAlerts(farm, observations, healthResult) {
  const profile = getCropProfile(farm.cropType || "cocoa");
  const { thresholds } = profile;

  const validObs = observations.filter((o) => o.ndviMean != null);
  if (validObs.length === 0) return [];

  const latest = validObs[validObs.length - 1];
  const recent3 = validObs.slice(-3);

  // 1. Check for Active Alerts on this farm
  const activeAlerts = await Alert.find({ farmId: farm._id, resolvedAt: null });
  const activeByType = new Map(activeAlerts.map((a) => [a.type, a]));

  const alertsToCreate = [];
  const alertsToResolve = [];

  // Condition A: Drought Stress (falling NDMI across recent observations)
  const isDrought =
    latest.ndmiMean != null && latest.ndmiMean < thresholds.ndmiDroughtThreshold;
  if (isDrought) {
    if (!activeByType.has("drought")) {
      const severity =
        latest.ndmiMean < thresholds.ndmiSevereDroughtThreshold ? "critical" : "warning";
      alertsToCreate.push({
        farmId: farm._id,
        orgId: farm.orgId,
        type: "drought",
        severity,
        message: `Low moisture index detected (NDMI: ${latest.ndmiMean}). Canopy is experiencing water stress.`,
        observedAt: latest.obsDate,
      });
    }
  } else if (activeByType.has("drought")) {
    alertsToResolve.push(activeByType.get("drought")._id);
  }

  // Condition B: Stress Early Warning (NDRE drop)
  if (recent3.length >= 2 && latest.ndreMean != null) {
    const priorNdre = recent3[0].ndreMean;
    const isStress =
      priorNdre != null && priorNdre - latest.ndreMean >= thresholds.ndreStressDropThreshold;
    if (isStress) {
      if (!activeByType.has("stress")) {
        alertsToCreate.push({
          farmId: farm._id,
          orgId: farm.orgId,
          type: "stress",
          severity: "warning",
          message: `Rapid decline in chlorophyll index (NDRE). Early indicator of potential disease or foliar stress.`,
          observedAt: latest.obsDate,
        });
      }
    } else if (activeByType.has("stress")) {
      alertsToResolve.push(activeByType.get("stress")._id);
    }
  }

  // Condition C: Vegetation Decline (Health is at_risk or score < 50)
  if (healthResult.status === "at_risk") {
    if (!activeByType.has("decline")) {
      alertsToCreate.push({
        farmId: farm._id,
        orgId: farm.orgId,
        type: "decline",
        severity: "critical",
        message: `Significant vegetation decline detected (Score: ${healthResult.score || "N/A"}/100). Ground inspection recommended.`,
        observedAt: latest.obsDate,
      });
    }
  } else if (healthResult.status === "healthy" && activeByType.has("decline")) {
    alertsToResolve.push(activeByType.get("decline")._id);
  }

  // Condition D: Patchy Canopy
  if (latest.ndviStd != null && latest.ndviStd >= thresholds.highPatchinessStd) {
    if (!activeByType.has("patchy")) {
      alertsToCreate.push({
        farmId: farm._id,
        orgId: farm.orgId,
        type: "patchy",
        severity: "info",
        message: `High spatial variance across plot (NDVI standard deviation ${latest.ndviStd}). Indicates localized canopy loss or uneven shade.`,
        observedAt: latest.obsDate,
      });
    }
  } else if (activeByType.has("patchy")) {
    alertsToResolve.push(activeByType.get("patchy")._id);
  }

  // Execute resolutions
  if (alertsToResolve.length > 0) {
    await Alert.updateMany(
      { _id: { $in: alertsToResolve } },
      { $set: { resolvedAt: new Date() } }
    );
  }

  // Execute creations
  if (alertsToCreate.length > 0) {
    await Alert.insertMany(alertsToCreate);
  }

  return await Alert.find({ farmId: farm._id, resolvedAt: null }).sort({ createdAt: -1 });
}
