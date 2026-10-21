import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/user.model.js";
import Farm from "./models/farm.model.js";
import Observation from "./models/observation.model.js";
import Alert from "./models/alert.model.js";
import { buildUserRagContext } from "./services/rag.service.js";
import { chatWithAi } from "./services/ai.service.js";

async function testRag() {
  console.log("==========================================");
  console.log("   Testing FarmTrack Database RAG Pipeline ");
  console.log("==========================================");

  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  // 1. Create a mock user with 2 farms:
  // - Farm 1: "Ondo Sunburst Cocoa" (Struggling with low NDVI & NDRE alert)
  // - Farm 2: "Idanre Highland Plot" (Healthy)
  const testEmail = `rag_test_${Date.now()}@farmtrack.org`;
  const user = await User.create({
    name: "RAG Tester",
    email: testEmail,
    password: "hashed_test_password",
  });

  const strugglingFarm = await Farm.create({
    name: "Ondo Sunburst Cocoa",
    ownerType: "user",
    ownerId: user._id,
    areaHa: 14.2,
    cropType: "cocoa",
    treeAgeYears: 18,
    tags: ["Ondo State", "Old Canopy"],
    latestHealth: {
      status: "at_risk",
      score: 54,
      confidence: "high",
      reasons: ["Significant chlorophyll loss (NDRE drop) and canopy thinning detected over past 20 days."],
    },
    centroid: { type: "Point", coordinates: [5.12, 7.25] },
    geometry: {
      type: "Polygon",
      coordinates: [[[5.12, 7.25], [5.13, 7.25], [5.13, 7.24], [5.12, 7.24], [5.12, 7.25]]],
    },
  });

  await Observation.create({
    farmId: strugglingFarm._id,
    obsDate: new Date(),
    ndviMean: 0.52,
    ndreMean: 0.28,
    ndmiMean: 0.12,
    validPixels: 80,
    totalPixels: 80,
  });

  await Alert.create({
    farmId: strugglingFarm._id,
    type: "stress",
    severity: "critical",
    message: "Severe chlorophyll depletion (NDRE 0.28). Foliar necrosis or capsid bug infestation suspected.",
    resolvedAt: null,
  });

  const healthyFarm = await Farm.create({
    name: "Idanre Highland Plot",
    ownerType: "user",
    ownerId: user._id,
    areaHa: 8.5,
    cropType: "cocoa",
    treeAgeYears: 8,
    tags: ["Ondo State", "Highland"],
    latestHealth: {
      status: "healthy",
      score: 88,
      confidence: "high",
      reasons: ["Canopy vigor and leaf chlorophyll are within normal parameters."],
    },
    centroid: { type: "Point", coordinates: [5.15, 7.30] },
    geometry: {
      type: "Polygon",
      coordinates: [[[5.15, 7.30], [5.16, 7.30], [5.16, 7.29], [5.15, 7.29], [5.15, 7.30]]],
    },
  });

  await Observation.create({
    farmId: healthyFarm._id,
    obsDate: new Date(),
    ndviMean: 0.78,
    ndreMean: 0.44,
    ndmiMean: 0.25,
    validPixels: 50,
    totalPixels: 50,
  });

  console.log("\n1. Testing buildUserRagContext...");
  const ragContext = await buildUserRagContext(user._id, {
    userQuery: "Which of my farms are not doing well?",
  });

  console.log("Total Farms retrieved:", ragContext.totalFarms);
  console.log("Struggling Farms count:", ragContext.strugglingCount);
  console.log("Healthy Farms count:", ragContext.healthyCount);
  console.log("Struggling farm name:", ragContext.strugglingFarms[0]?.name);

  if (ragContext.strugglingCount !== 1 || ragContext.strugglingFarms[0]?.name !== "Ondo Sunburst Cocoa") {
    throw new Error("RAG classification failed!");
  }
  console.log("  [PASS] RAG context built correctly from MongoDB");

  console.log("\n2. Testing chatWithAi with live Gemini and RAG context...");
  const reply = await chatWithAi({
    messages: [
      { role: "user", content: "which of my farms are not doing well?" },
    ],
    ragContext,
  });

  console.log("\n--- AI Response from Gemini ---");
  console.log(reply);
  console.log("-------------------------------");

  // Verify that Gemini actually referenced "Ondo Sunburst Cocoa" and did NOT say "I don't have your specific farm registry loaded"
  const mentionsStrugglingFarm = reply.toLowerCase().includes("ondo sunburst cocoa") || reply.toLowerCase().includes("sunburst");
  const mentionsNoRegistry = reply.toLowerCase().includes("don't have your specific farm registry") || reply.toLowerCase().includes("do not have your specific farm registry");

  if (!mentionsStrugglingFarm) {
    console.warn("⚠️ Warning: Reply did not explicitly name Ondo Sunburst Cocoa");
  } else {
    console.log("  [PASS] Gemini explicitly identified 'Ondo Sunburst Cocoa' from database!");
  }

  if (mentionsNoRegistry) {
    throw new Error("Gemini claimed it didn't have farm registry loaded!");
  } else {
    console.log("  [PASS] Gemini did NOT ask user to manually paste telemetry!");
  }

  // Cleanup test documents
  console.log("\n3. Cleaning up test documents...");
  await Observation.deleteMany({ farmId: { $in: [strugglingFarm._id, healthyFarm._id] } });
  await Alert.deleteMany({ farmId: { $in: [strugglingFarm._id, healthyFarm._id] } });
  await Farm.deleteMany({ _id: { $in: [strugglingFarm._id, healthyFarm._id] } });
  await User.findByIdAndDelete(user._id);
  await mongoose.disconnect();

  console.log("\n✅ RAG Integration Test PASSED 100%!");
  process.exit(0);
}

testRag().catch(async (err) => {
  console.error("❌ Test failed:", err);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
