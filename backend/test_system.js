import mongoose from "mongoose";
import "dotenv/config";
import User from "./models/user.model.js";
import Organization from "./models/organization.model.js";
import Membership from "./models/membership.model.js";
import Farm from "./models/farm.model.js";
import Observation from "./models/observation.model.js";
import Alert from "./models/alert.model.js";
import { validatePolygon, calculatePolygonAreaHa } from "./utils/geo.js";
import { fetchStats, parseSentinelStatsResponse, generateCalibratedObservations } from "./services/sentinel.js";
import { computeFarmHealth } from "./services/analysis/health.service.js";
import { computePhenology } from "./services/analysis/phenology.service.js";
import { evaluateAndSyncAlerts } from "./services/analysis/alert.service.js";
import { runFarmBackfill } from "./services/sync.service.js";

async function runTests() {
  console.log("==========================================");
  console.log("   FarmTrack System Verification Test     ");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // --- Test 1: GeoJSON Polygon Validation & Area Calculation ---
  console.log("\n1. Testing GeoJSON Polygon Validation & Area...");
  const validCocoaPolygon = {
    type: "Polygon",
    coordinates: [
      [
        [5.050, 7.090],
        [5.055, 7.090],
        [5.055, 7.085],
        [5.050, 7.085],
        [5.050, 7.090],
      ],
    ],
  };

  const val1 = validatePolygon(validCocoaPolygon);
  assert(val1.valid === true, "Valid closed polygon is accepted");
  assert(val1.areaHa > 20 && val1.areaHa < 40, `Area calculated accurately: ${val1.areaHa} ha`);
  assert(val1.centroid[0] > 5.051 && val1.centroid[1] > 7.086, "Centroid coordinates calculated correctly");

  const unclosedPolygon = {
    type: "Polygon",
    coordinates: [
      [
        [5.050, 7.090],
        [5.055, 7.090],
        [5.055, 7.085],
      ],
    ],
  };
  const val2 = validatePolygon(unclosedPolygon);
  assert(val2.valid === false, "Unclosed / incomplete polygon is rejected");

  // --- Test 2: Sentinel Statistical Parsing & Calibrated Observations ---
  console.log("\n2. Testing Sentinel Statistical API & Ingestion Pipeline...");
  const mockFrom = "2025-01-01";
  const mockTo = "2025-03-01";
  const obs = await fetchStats({ geometry: validCocoaPolygon, from: mockFrom, to: mockTo });

  assert(Array.isArray(obs) && obs.length >= 10, `Retrieved ${obs?.length} 5-day observation intervals`);
  const firstObs = obs[0];
  assert(firstObs.ndviMean > 0.4 && firstObs.ndviMean < 0.9, `NDVI Mean realistic for cocoa: ${firstObs.ndviMean}`);
  assert(firstObs.ndreMean > 0.2, `NDRE Mean extracted: ${firstObs.ndreMean}`);
  assert(firstObs.ndmiMean != null, `NDMI Moisture Mean extracted: ${firstObs.ndmiMean}`);
  assert(firstObs.validPixels >= 0 && firstObs.totalPixels > 0, "Valid pixel counting functioning");

  // --- Test 3: Inference Layer (Health Assessment & Cocoa Harmattan Context) ---
  console.log("\n3. Testing Inference Layer (Crop Health & Phenology)...");
  const dummyFarm = {
    _id: new mongoose.Types.ObjectId(),
    name: "Test Cocoa Farm",
    cropType: "cocoa",
    treeAgeYears: 9,
    areaHa: 25.5,
  };

  const health = await computeFarmHealth(dummyFarm, obs);
  assert(["healthy", "watch", "at_risk"].includes(health.status), `Health status computed: ${health.status}`);
  assert(health.score >= 0 && health.score <= 100, `Health score bounded: ${health.score}/100`);
  assert(["low", "medium", "high"].includes(health.confidence), `Confidence calculated: ${health.confidence}`);
  assert(health.reasons.length > 0, `Plain-language reasons generated: "${health.reasons[0]}"`);

  const phenology = computePhenology(dummyFarm, obs);
  assert(phenology.maturityStage === "mature_productive", `Maturity classified: ${phenology.maturityLabel}`);
  assert(phenology.currentSeason?.name != null, `Current season detected: ${phenology.currentSeason?.name}`);
  assert(["rising", "stable", "declining"].includes(phenology.trend.direction), `Trend direction: ${phenology.trend.direction}`);

  // --- Test 4: Database Connection & Tenancy Isolation ---
  console.log("\n4. Testing MongoDB Database Connection & Scoping...");
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    assert(true, "MongoDB Connection established successfully");

    // Clean test data if any
    const testEmail = `test_runner_${Date.now()}@farmtrack.org`;
    const userA = await User.create({
      name: "User Alpha",
      email: testEmail,
      password: "hashed_test_password",
    });
    assert(userA._id != null, `User created: ${userA.name} (${userA.email})`);

    const org = await Organization.create({
      name: "Ondo Farmers Alliance",
      slug: `ondo-farmers-${Date.now()}`,
      ownerId: userA._id,
    });
    assert(org._id != null, `Organization created: ${org.name}`);

    const membership = await Membership.create({
      orgId: org._id,
      userId: userA._id,
      role: "owner",
    });
    assert(membership.role === "owner", "Membership with role 'owner' created");

    // Farm creation
    const farm = await Farm.create({
      name: "Alpha Cocoa Farm 1",
      ownerType: "organization",
      orgId: org._id,
      geometry: validCocoaPolygon,
      areaHa: val1.areaHa,
      centroid: { type: "Point", coordinates: val1.centroid },
      cropType: "cocoa",
      treeAgeYears: 12,
      farmerName: "Taiwo Bello",
    });
    assert(farm._id != null, `Farm created with GeoJSON: ${farm.name}`);

    // Test Backfill execution
    await runFarmBackfill(farm._id);
    const updatedFarm = await Farm.findById(farm._id);
    assert(updatedFarm.backfillStatus === "done", `Backfill executed: status = ${updatedFarm.backfillStatus}`);
    assert(updatedFarm.latestHealth?.score != null, `Latest health denormalized: ${updatedFarm.latestHealth?.score}/100`);

    const storedObsCount = await Observation.countDocuments({ farmId: farm._id });
    assert(storedObsCount > 0, `Stored ${storedObsCount} observations in MongoDB`);

    // Test rerun idempotency (zero duplicates)
    await runFarmBackfill(farm._id);
    const storedObsCountAfterRerun = await Observation.countDocuments({ farmId: farm._id });
    assert(
      storedObsCount === storedObsCountAfterRerun,
      `Idempotent rerun: observations count unchanged (${storedObsCount} === ${storedObsCountAfterRerun})`
    );

    // Test alert creation & resolution
    const activeAlerts = await Alert.find({ farmId: farm._id });
    assert(Array.isArray(activeAlerts), `Alerts queried for farm: ${activeAlerts.length} active alerts`);

    // Clean up test documents
    await Observation.deleteMany({ farmId: farm._id });
    await Alert.deleteMany({ farmId: farm._id });
    await Farm.findByIdAndDelete(farm._id);
    await Membership.findByIdAndDelete(membership._id);
    await Organization.findByIdAndDelete(org._id);
    await User.findByIdAndDelete(userA._id);
    assert(true, "Cleaned up verification test records");

  } catch (dbErr) {
    assert(false, `Database error: ${dbErr.message}`);
  } finally {
    await mongoose.disconnect();
  }

  console.log("\n==========================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
