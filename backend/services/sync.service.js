import Farm from "../models/farm.model.js";
import Observation from "../models/observation.model.js";
import { fetchStats } from "./sentinel.js";
import { computeFarmHealth } from "./analysis/health.service.js";
import { evaluateAndSyncAlerts } from "./analysis/alert.service.js";
import { backfillQueue } from "./queue.service.js";

/**
 * Triggers asynchronous backfill for a farm (1-2 years of satellite history).
 * Queues the task and returns immediately without blocking.
 */
export function enqueueFarmBackfill(farmId) {
  Farm.findByIdAndUpdate(farmId, { backfillStatus: "pending" }).catch(() => {});
  backfillQueue.add(() => runFarmBackfill(farmId));
}

/**
 * Executes historical backfill for a single farm.
 */
export async function runFarmBackfill(farmId) {
  const farm = await Farm.findById(farmId);
  if (!farm) return;

  console.log(`[Sync] Starting backfill for farm "${farm.name}" (${farmId})...`);
  await Farm.findByIdAndUpdate(farmId, { backfillStatus: "running" });

  try {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setFullYear(fromDate.getFullYear() - 1); // 1 full year backfill
    fromDate.setMonth(fromDate.getMonth() - 6); // + 6 months = 1.5 years

    const fromStr = fromDate.toISOString().slice(0, 10);
    const toStr = toDate.toISOString().slice(0, 10);

    const stats = await fetchStats({
      geometry: farm.geometry,
      from: fromStr,
      to: toStr,
    });

    const minValidThreshold = parseFloat(process.env.VALID_PIXEL_THRESHOLD || "0.20");

    let savedCount = 0;
    for (const item of stats) {
      // Skip intervals where valid pixel ratio is below threshold (e.g. heavy cloud cover)
      if (item.totalPixels > 0 && item.validPixels / item.totalPixels < minValidThreshold) {
        continue;
      }

      await Observation.findOneAndUpdate(
        { farmId: farm._id, obsDate: item.obsDate },
        {
          $set: {
            ...item,
            farmId: farm._id,
          },
        },
        { upsert: true, new: true }
      );
      savedCount++;
    }

    // Refresh observations and compute health
    const observations = await Observation.find({ farmId: farm._id })
      .sort({ obsDate: 1 })
      .lean();

    const healthResult = await computeFarmHealth(farm, observations);
    await evaluateAndSyncAlerts(farm, observations, healthResult);

    await Farm.findByIdAndUpdate(farmId, {
      backfillStatus: "done",
      lastSyncedAt: new Date(),
      latestHealth: {
        status: healthResult.status,
        score: healthResult.score,
        confidence: healthResult.confidence,
        reasons: healthResult.reasons,
        updatedAt: new Date(),
      },
    });

    console.log(
      `[Sync] Backfill completed for farm "${farm.name}": saved ${savedCount} observations, health status: ${healthResult.status} (${healthResult.score}/100)`
    );
  } catch (err) {
    console.error(`[Sync] Backfill failed for farm ${farmId}: ${err.message}`);
    await Farm.findByIdAndUpdate(farmId, { backfillStatus: "failed" });
  }
}

/**
 * Performs delta sync for a farm from its latest stored observation to today.
 */
export async function syncFarmDelta(farmId) {
  const farm = await Farm.findById(farmId);
  if (!farm) return;

  const latestObs = await Observation.findOne({ farmId }).sort({ obsDate: -1 });

  let fromDate;
  if (latestObs) {
    fromDate = new Date(latestObs.obsDate);
    fromDate.setUTCDate(fromDate.getUTCDate() + 1); // start after latest obs
  } else {
    fromDate = new Date();
    fromDate.setUTCDate(fromDate.getUTCDate() - 30);
  }

  const toDate = new Date();
  // If latest obs is within the last 3 days, no sync needed
  if (toDate.getTime() - fromDate.getTime() < 3 * 24 * 60 * 60 * 1000) {
    return;
  }

  const fromStr = fromDate.toISOString().slice(0, 10);
  const toStr = toDate.toISOString().slice(0, 10);

  const stats = await fetchStats({
    geometry: farm.geometry,
    from: fromStr,
    to: toStr,
  });

  const minValidThreshold = parseFloat(process.env.VALID_PIXEL_THRESHOLD || "0.20");

  for (const item of stats) {
    if (item.totalPixels > 0 && item.validPixels / item.totalPixels < minValidThreshold) {
      continue;
    }
    await Observation.findOneAndUpdate(
      { farmId: farm._id, obsDate: item.obsDate },
      { $set: { ...item, farmId: farm._id } },
      { upsert: true, new: true }
    );
  }

  const observations = await Observation.find({ farmId: farm._id })
    .sort({ obsDate: 1 })
    .lean();

  const healthResult = await computeFarmHealth(farm, observations);
  await evaluateAndSyncAlerts(farm, observations, healthResult);

  await Farm.findByIdAndUpdate(farmId, {
    lastSyncedAt: new Date(),
    latestHealth: {
      status: healthResult.status,
      score: healthResult.score,
      confidence: healthResult.confidence,
      reasons: healthResult.reasons,
      updatedAt: new Date(),
    },
  });
}
