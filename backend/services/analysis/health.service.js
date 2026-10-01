import mongoose from "mongoose";
import { getCropProfile } from "./cropProfiles.js";
import Farm from "../../models/farm.model.js";
import Observation from "../../models/observation.model.js";

/**
 * Computes health assessment, confidence score, and plain-language reasons for a farm.
 *
 * @param {Object} farm Farm document
 * @param {Array} observations Chronological array of observations (oldest to newest)
 * @returns {Object} { status, score, confidence, reasons }
 */
export async function computeFarmHealth(farm, observations = null) {
  if (!observations) {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      observations = [];
    } else {
      observations = await Observation.find({ farmId: farm._id })
        .sort({ obsDate: 1 })
        .lean();
    }
  }

  // Filter observations that meet the valid pixel threshold (default >= 20%)
  const minValidThreshold = parseFloat(process.env.VALID_PIXEL_THRESHOLD || "0.20");
  const validObs = observations.filter(
    (o) => o.totalPixels > 0 && o.validPixels / o.totalPixels >= minValidThreshold && o.ndviMean != null
  );

  if (validObs.length === 0) {
    return {
      status: "insufficient_data",
      score: null,
      confidence: "low",
      reasons: ["No cloud-free satellite observations available yet."],
    };
  }

  const profile = getCropProfile(farm.cropType || "cocoa");
  const { thresholds } = profile;

  // Latest valid observation and recent window (last 3 observations)
  const latest = validObs[validObs.length - 1];
  const recentWindow = validObs.slice(-3);
  const recentNdviAvg =
    recentWindow.reduce((acc, o) => acc + o.ndviMean, 0) / recentWindow.length;
  const recentNdreAvg =
    recentWindow.filter((o) => o.ndreMean != null).length > 0
      ? recentWindow.reduce((acc, o) => acc + (o.ndreMean || 0), 0) /
        recentWindow.filter((o) => o.ndreMean != null).length
      : null;
  const recentNdmiAvg =
    latest.ndmiMean != null
      ? recentWindow.reduce((acc, o) => acc + (o.ndmiMean || 0), 0) / recentWindow.length
      : null;

  // Check seasonal context (e.g. Harmattan dry season in Dec-Feb)
  const obsMonth = new Date(latest.obsDate).getUTCMonth() + 1;
  const currentSeason = profile.seasons.find((s) => s.months.includes(obsMonth));
  const isHarmattanDipExpected = currentSeason?.expectedDip || false;

  const reasons = [];
  let score = 85; // Baseline healthy score

  // 1. History comparison (same 30-day window in earlier years)
  const currentDayOfYear = getDayOfYear(latest.obsDate);
  const historicalSameSeasonObs = validObs.filter((o) => {
    const d = new Date(o.obsDate);
    const yearDiff = new Date(latest.obsDate).getFullYear() - d.getFullYear();
    if (yearDiff < 1) return false; // same year, not prior season
    const dayDiff = Math.abs(getDayOfYear(o.obsDate) - currentDayOfYear);
    return dayDiff <= 25; // within 25 days of same season window
  });

  if (historicalSameSeasonObs.length > 0) {
    const histAvgNdvi =
      historicalSameSeasonObs.reduce((a, b) => a + b.ndviMean, 0) /
      historicalSameSeasonObs.length;
    const dropPct = ((histAvgNdvi - recentNdviAvg) / histAvgNdvi) * 100;

    if (dropPct >= thresholds.historicalDropCriticalPct) {
      score -= 30;
      reasons.push(
        `Vegetation greenness is ${Math.round(dropPct)}% lower than this farm's historical baseline for ${currentSeason?.name || "this season"}.`
      );
    } else if (dropPct >= thresholds.historicalDropWarningPct) {
      score -= 15;
      reasons.push(
        `Vegetation greenness is slightly depressed (${Math.round(dropPct)}% below historical average for this period).`
      );
    } else {
      reasons.push(
        `Vegetation density aligns with this farm's typical seasonal history (${Math.round(recentNdviAvg * 100) / 100} NDVI).`
      );
    }
  }

  // 2. Peer comparison (nearby farms within 25km of same crop)
  const peerComparison = await compareWithPeers(farm, latest.obsDate, recentNdviAvg);
  if (peerComparison) {
    if (peerComparison.dropPct >= thresholds.peerDropCriticalPct) {
      score -= 25;
      reasons.push(
        `Farm is underperforming nearby peer farms by ${Math.round(peerComparison.dropPct)}% (peer avg: ${peerComparison.peerAvgNdvi}).`
      );
    } else if (peerComparison.dropPct >= thresholds.peerDropWarningPct) {
      score -= 12;
      reasons.push(
        `Farm greenness is moderately below neighbouring cocoa farms (${peerComparison.peerAvgNdvi} peer avg vs ${Math.round(recentNdviAvg * 100) / 100}).`
      );
    } else {
      reasons.push(`Canopy vigor is on par with surrounding peer farms in the region.`);
    }
  }

  // 3. Early stress warning: NDRE dropping while NDVI is still flat
  if (recentWindow.length >= 2 && latest.ndreMean != null) {
    const priorNdre = recentWindow[0].ndreMean;
    const priorNdvi = recentWindow[0].ndviMean;
    if (priorNdre != null && priorNdvi != null) {
      const ndreDelta = priorNdre - latest.ndreMean;
      const ndviDelta = priorNdvi - latest.ndviMean;

      // NDRE drops significantly while NDVI hasn't moved much yet
      if (ndreDelta >= thresholds.ndreStressDropThreshold && Math.abs(ndviDelta) < 0.05) {
        score -= 20;
        reasons.push(
          "Chlorophyll index (NDRE) showed an early drop while general canopy remains green — early indicator of foliar or pest stress."
        );
      }
    }
  }

  // 4. Moisture and drought stress (NDMI)
  if (recentNdmiAvg != null) {
    if (recentNdmiAvg < thresholds.ndmiSevereDroughtThreshold) {
      score -= isHarmattanDipExpected ? 12 : 25; // less severe deduction if dry season Harmattan
      reasons.push(
        `Severe canopy moisture deficit detected (NDMI ${recentNdmiAvg.toFixed(2)}). ${
          isHarmattanDipExpected ? "Partially expected during dry season, but monitor closely." : "Significant drought stress."
        }`
      );
    } else if (recentNdmiAvg < thresholds.ndmiDroughtThreshold) {
      score -= isHarmattanDipExpected ? 6 : 14;
      reasons.push(
        `Low canopy moisture detected (NDMI ${recentNdmiAvg.toFixed(2)}). Irrigation or mulch inspection advised.`
      );
    }
  }

  // 5. Spatial Patchiness (high standard deviation across polygon)
  if (latest.ndviStd != null && latest.ndviStd >= thresholds.highPatchinessStd) {
    score -= 10;
    reasons.push(
      `Canopy is patchy / uneven across the plot (NDVI standard deviation ${latest.ndviStd.toFixed(2)}). Ground inspection advised.`
    );
  }

  // Seasonal context note if Harmattan
  if (isHarmattanDipExpected) {
    reasons.push(
      "Harmattan dry season in effect: mild seasonal canopy thinning and lower moisture are expected for West African cocoa."
    );
  }

  // Clamp score 0..100
  score = Math.max(10, Math.min(100, Math.round(score)));

  // Status mapping
  let status = "healthy";
  if (score < 50) {
    status = "at_risk";
  } else if (score < 75) {
    status = "watch";
  }

  // Confidence calculation
  const confidence = calculateConfidence(farm, validObs);

  return {
    status,
    score,
    confidence,
    reasons,
  };
}

/**
 * Computes confidence level (low, medium, high) based on:
 * - Farm area: plots < 0.5 ha have high edge pixel noise -> lower confidence
 * - Valid pixel ratio of recent observations
 * - Total number of valid observations
 */
function calculateConfidence(farm, validObs) {
  let confidencePoints = 0;

  // Farm area factor (10m Sentinel resolution)
  if (farm.areaHa >= 2.0) {
    confidencePoints += 2;
  } else if (farm.areaHa >= 0.5) {
    confidencePoints += 1;
  } // < 0.5 ha gets 0 points due to boundary noise

  // Observation volume factor
  if (validObs.length >= 15) {
    confidencePoints += 2;
  } else if (validObs.length >= 5) {
    confidencePoints += 1;
  }

  // Recent pixel quality
  const recent = validObs.slice(-3);
  const avgValidRatio =
    recent.reduce((acc, o) => acc + (o.totalPixels > 0 ? o.validPixels / o.totalPixels : 0), 0) /
    recent.length;

  if (avgValidRatio >= 0.7) {
    confidencePoints += 2;
  } else if (avgValidRatio >= 0.4) {
    confidencePoints += 1;
  }

  if (confidencePoints >= 5) return "high";
  if (confidencePoints >= 3) return "medium";
  return "low";
}

/**
 * Compares current farm NDVI with peer farms within 25km.
 */
async function compareWithPeers(farm, obsDate, currentNdvi) {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) return null;
  if (!farm.centroid?.coordinates) return null;

  try {
    const [lng, lat] = farm.centroid.coordinates;
    const maxDistanceMeters = 25000; // 25km radius

    // Find nearby farms with same crop
    const nearbyFarms = await Farm.find({
      _id: { $ne: farm._id },
      cropType: farm.cropType || "cocoa",
      centroid: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxDistanceMeters,
        },
      },
    })
      .limit(10)
      .select("_id")
      .lean();

    if (nearbyFarms.length < 2) return null;

    const peerIds = nearbyFarms.map((f) => f._id);
    const dateStart = new Date(obsDate);
    dateStart.setUTCDate(dateStart.getUTCDate() - 15);
    const dateEnd = new Date(obsDate);
    dateEnd.setUTCDate(dateEnd.getUTCDate() + 15);

    const peerObservations = await Observation.find({
      farmId: { $in: peerIds },
      obsDate: { $gte: dateStart, $lte: dateEnd },
      ndviMean: { $ne: null },
    }).lean();

    if (peerObservations.length < 2) return null;

    const peerAvgNdvi =
      peerObservations.reduce((acc, o) => acc + o.ndviMean, 0) / peerObservations.length;
    const roundedPeerAvg = Math.round(peerAvgNdvi * 100) / 100;

    const dropPct = ((peerAvgNdvi - currentNdvi) / peerAvgNdvi) * 100;
    return {
      peerAvgNdvi: roundedPeerAvg,
      dropPct,
      peerCount: nearbyFarms.length,
    };
  } catch (err) {
    return null;
  }
}

function getDayOfYear(date) {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
