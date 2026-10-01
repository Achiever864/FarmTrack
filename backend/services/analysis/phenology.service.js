import { getCropProfile } from "./cropProfiles.js";

/**
 * Computes growth / phenological status for perennial cocoa tree crops.
 *
 * @param {Object} farm
 * @param {Array} observations (chronological)
 */
export function computePhenology(farm, observations = []) {
  const profile = getCropProfile(farm.cropType || "cocoa");

  // 1. Determine tree age
  let treeAge = farm.treeAgeYears;
  if (treeAge == null && farm.plantingDate) {
    const msDiff = Date.now() - new Date(farm.plantingDate).getTime();
    treeAge = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24 * 365.25)));
  }

  // 2. Classify maturity stage
  let stageLabel = "Unknown Age (Assumed Mature)";
  let stageCode = "mature_productive";

  if (treeAge != null) {
    const stage = profile.maturityStages.find(
      (s) => treeAge >= s.minAge && treeAge < s.maxAge
    );
    if (stage) {
      stageLabel = stage.label;
      stageCode = stage.stage;
    }
  }

  // 3. Current seasonal period in calendar
  const now = new Date();
  const currentMonth = now.getUTCMonth() + 1;
  const currentSeason =
    profile.seasons.find((s) => s.months.includes(currentMonth)) || profile.seasons[0];

  // 4. Trend direction over recent valid observations (last 4 obs ~ 20 days)
  const validObs = observations.filter((o) => o.ndviMean != null);
  let trend = "stable";
  let ndviDelta = 0;

  if (validObs.length >= 3) {
    const recent = validObs.slice(-3);
    const firstNdvi = recent[0].ndviMean;
    const lastNdvi = recent[recent.length - 1].ndviMean;
    ndviDelta = Math.round((lastNdvi - firstNdvi) * 1000) / 1000;

    if (ndviDelta > 0.04) {
      trend = "rising";
    } else if (ndviDelta < -0.04) {
      trend = "declining";
    } else {
      trend = "stable";
    }
  }

  return {
    cropType: farm.cropType || "cocoa",
    treeAgeYears: treeAge,
    maturityStage: stageCode,
    maturityLabel: stageLabel,
    currentSeason: {
      name: currentSeason.name,
      description: currentSeason.description,
      isDrySeason: currentSeason.isDrySeason,
    },
    trend: {
      direction: trend,
      delta: ndviDelta,
    },
  };
}
