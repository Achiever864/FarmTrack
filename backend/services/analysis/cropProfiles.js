/**
 * Crop Profiles Configuration
 * Contains agronomic defaults, maturity stages, seasonal calendars, and stress thresholds.
 * Configured per crop so more crops can be added without schema or logic changes.
 */

export const cropProfiles = {
  cocoa: {
    name: "Cocoa (Theobroma cacao)",
    type: "perennial_tree",
    isEvergreen: true,

    // Maturity stages based on tree age in years or planting date
    maturityStages: [
      { minAge: 0, maxAge: 2, stage: "young_seedling", label: "Young / Seedling (< 2 yrs)" },
      { minAge: 2, maxAge: 5, stage: "establishing", label: "Establishing (2–5 yrs)" },
      { minAge: 5, maxAge: 25, stage: "mature_productive", label: "Mature Productive (5–25 yrs)" },
      { minAge: 25, maxAge: 100, stage: "old_declining", label: "Old / Declining (> 25 yrs)" },
    ],

    // Seasonal calendar for West Africa cocoa belt (Nigeria, Ghana, Côte d'Ivoire)
    // Months are 1-indexed (1 = January, 12 = December)
    seasons: [
      {
        name: "Harmattan / Dry Season",
        months: [12, 1, 2],
        isDrySeason: true,
        expectedDip: true,
        description: "Dry winds, low humidity, natural canopy thinning/moisture drop. NDVI dip is expected.",
      },
      {
        name: "Early Rains / Flushing",
        months: [3, 4],
        isDrySeason: false,
        expectedDip: false,
        description: "Start of rainy season, vegetative flushing and flowering.",
      },
      {
        name: "Mid-Crop Season",
        months: [5, 6, 7, 8],
        isDrySeason: false,
        expectedDip: false,
        description: "Mid-crop pod development and minor harvest window.",
      },
      {
        name: "Main-Crop Harvest",
        months: [9, 10, 11],
        isDrySeason: false,
        expectedDip: false,
        description: "Peak harvest and maximum canopy density.",
      },
    ],

    // Agronomic baseline and stress thresholds
    thresholds: {
      // Baseline typical NDVI range for healthy mature cocoa
      healthyNdviMin: 0.55,
      watchNdviMin: 0.45,

      // Stress warning: NDRE drops relative to history while NDVI may lag
      ndreStressDropThreshold: 0.08, // drop of > 0.08 in NDRE indicates chlorophyll/foliar stress

      // Moisture / Drought: NDMI falling below threshold
      ndmiDroughtThreshold: 0.12, // NDMI < 0.12 indicates water stress / drought
      ndmiSevereDroughtThreshold: 0.05,

      // Spatial patchiness: standard deviation of NDVI across farm polygon
      highPatchinessStd: 0.14, // stDev > 0.14 indicates severe uneven canopy health

      // History comparison: drop compared to the farm's own same-period historical average
      historicalDropWarningPct: 12, // > 12% drop compared to prior seasons
      historicalDropCriticalPct: 22, // > 22% drop

      // Peer comparison: drop compared to neighbouring peer farms of same crop
      peerDropWarningPct: 10,
      peerDropCriticalPct: 18,
    },
  },
};

/**
 * Returns the profile for a given crop type, defaulting to cocoa.
 */
export function getCropProfile(cropType = "cocoa") {
  return cropProfiles[cropType] || cropProfiles.cocoa;
}
