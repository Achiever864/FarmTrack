import cron from "node-cron";
import Farm from "../models/farm.model.js";
import { syncFarmDelta } from "../services/sync.service.js";

let isCronRunning = false;

/**
 * Runs delta sync across all active farms with execution lock and concurrency protection.
 */
export async function runGlobalSyncJob() {
  if (isCronRunning) {
    console.log("[Cron] Sync job is already in progress, skipping overlapping execution.");
    return;
  }

  isCronRunning = true;
  console.log("[Cron] Starting scheduled satellite observation sync job...");

  try {
    const farms = await Farm.find({}).select("_id name").lean();
    console.log(`[Cron] Found ${farms.length} farms to check for updates.`);

    for (const farm of farms) {
      try {
        await syncFarmDelta(farm._id);
      } catch (err) {
        console.error(`[Cron] Error syncing farm ${farm.name} (${farm._id}): ${err.message}`);
      }
    }

    console.log("[Cron] Scheduled satellite observation sync job completed.");
  } catch (err) {
    console.error(`[Cron] Global sync job encountered an error: ${err.message}`);
  } finally {
    isCronRunning = false;
  }
}

/**
 * Initializes the cron scheduler (every midnight: '0 0 * * *' or every 24 hours).
 */
export function initSyncCron() {
  // Run daily at 02:00 UTC
  cron.schedule("0 2 * * *", () => {
    runGlobalSyncJob();
  });
  console.log("[Cron] Satellite delta sync scheduler initialized (daily at 02:00 UTC).");
}
