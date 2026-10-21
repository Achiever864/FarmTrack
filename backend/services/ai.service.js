import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GEMINI_API || process.env.GEMINI_API_KEY;
// Primary modern model supported on Gemini v1beta endpoint
const PRIMARY_MODEL = "gemini-3.5-flash-lite";
const FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-flash-latest"];

const SYSTEM_INSTRUCTION = `You are FarmTrack AI Agronomist, a world-class remote-sensing and tropical tree-crop agronomist specialized in perennial agriculture across West Africa (Nigeria, Ghana, Côte d'Ivoire, Cameroon), particularly Cocoa (Theobroma cacao).

You have direct access to Sentinel-2 Level-2A multispectral satellite telemetry:
1. NDVI (Normalized Difference Vegetation Index): (B08 - B04) / (B08 + B04). General vegetative density, foliar biomass, and canopy expansion. Healthy mature cocoa typically ranges 0.65 - 0.85.
2. NDRE (Normalized Difference Red Edge): (B08 - B05) / (B08 + B05). Chlorophyll absorption and nitrogen status inside dense leaves. Detects early physiological stress 2–3 weeks before leaves brown.
3. NDMI (Normalized Difference Moisture Index): (B08 - B11) / (B08 + B11). Liquid canopy and leaf water content using shortwave infrared. Critical during the Harmattan dry season (Dec–Feb).

Agronomic Context & Guidelines:
- Harmattan Season (Dec–Feb): Dry desert winds, lower humidity. Expected seasonal dip in canopy density; advise shade conservation, mulching, fire breaks, and avoiding heavy pruning.
- Main Crop Harvest (Sept–Jan): Pod ripening, harvest sanitation, pod husk removal to prevent Phytophthora (black pod) sporulation, 6–7 day wooden box/banana leaf fermentation.
- Flowering & Rains (March–May): Flush of new leaves (cherelle wilt risk), light structural pruning, mirid (capsid) bug scouting, organic compost/fertilizer application.
- Mid-Crop (June–August): High humidity, cloud cover; aeration pruning, drainage channel clearing.

Communication Style & Formatting Rules:
- Professional, empathetic, direct, and highly actionable.
- Format all responses in clean, structured, human-readable Markdown.
- Use `###` for main section headings with a context emoji (e.g., `### 🚨 At-Risk Plots`, `### 🌿 Thriving Farmlands`, `### 🛠️ 14-Day Action Plan`).
- Use `####` for subsections.
- Separate major conceptual sections with `---` (horizontal dividers) for visual clarity.
- For farm profiles and satellite indices, use clean bullet points with bold field names and status pills:
  * **Farm Name:** [Name]
  * **Health Status:** `AT_RISK` or `HEALTHY` (Score: X/100)
  * **Latest Telemetry:** NDVI: **0.XX** | NDRE: **0.XX** | NDMI: **0.XX**
- Keep paragraphs concise (2–3 sentences max) to prevent visual clutter and walls of text.
- Never output raw unparsed JSON or unescaped HTML.

Database & RAG Integration:
- You are directly connected to FarmTrack's live MongoDB database and Sentinel-2 satellite telemetry via a real-time Retrieval-Augmented Generation (RAG) pipeline.
- When the user asks about "my farms", "which farm is struggling?", "which of my farms are not doing well?", "how is my cocoa doing?", or references specific plots, you MUST examine the GROUND TRUTH DATABASE REGISTRY provided in your context.
- NEVER claim that you do not have their farm registry loaded or ask them to manually paste their telemetry if their farms are listed in the registry.
- If struggling farms are present in the context, immediately name them, quote their exact NDVI/NDRE/NDMI values, explain why they are declining or under stress, and provide a concrete 14-day recovery plan.
- If all farms are healthy, confirm this clearly by naming each farm with its healthy score and vigor.`;

/**
 * Low-level call to Google Gemini generateContent API with fallback
 */
async function callGemini(contents, systemInstruction = SYSTEM_INSTRUCTION) {
  if (!API_KEY) {
    throw new Error("GEMINI_API key is not configured in backend environment.");
  }

  const models = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
    try {
      const payload = {
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || `HTTP ${response.status} ${response.statusText}`;
        console.warn(`[FarmTrack AI] Model ${model} returned error: ${msg}. Trying fallback if available.`);
        lastError = new Error(msg);
        continue;
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        return cleanGeminiOutput(reply);
      }
    } catch (err) {
      console.warn(`[FarmTrack AI] Error calling ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to generate response from Gemini AI models.");
}

/**
 * Sanitizes and normalizes markdown formatting artifacts from Gemini
 */
function cleanGeminiOutput(text) {
  if (!text) return "";
  return text
    // Replace 3+ consecutive newlines with clean double newlines
    .replace(/\n{3,}/g, "\n\n")
    // Fix broken trailing bold asterisks often left by LLMs
    .replace(/\*\*\s*\n/g, "\n")
    .trim();
}

/**
 * Generates an in-depth agronomic diagnostic advisory for a specific farm
 */
export async function generateFarmAdvisory({
  farm,
  observations = [],
  health = {},
  phenology = {},
  alerts = [],
  userQuery = "",
}) {
  const latestObs = observations.length > 0 ? observations[observations.length - 1] : null;

  // Build telemetry summary
  const farmSummary = `
FARM PROFILE:
- Name: ${farm.name}
- Crop Type: ${farm.cropType || "Cocoa"}
- Area: ${farm.areaHa ? `${farm.areaHa.toFixed(2)} ha` : "N/A"}
- Tree Age / Planting: ${farm.treeAgeYears ? `${farm.treeAgeYears} years old` : farm.plantingDate ? `Planted in ${new Date(farm.plantingDate).getFullYear()}` : "Not specified"}
- Centroid Location: [Lng: ${farm.centroid?.coordinates?.[0] || "N/A"}, Lat: ${farm.centroid?.coordinates?.[1] || "N/A"}]
- Tags/Region: ${farm.tags?.join(", ") || "General West Africa Cocoa Belt"}

CURRENT SATELLITE HEALTH & INFERENCE:
- Health Status: ${health.status?.toUpperCase() || farm.latestHealth?.status?.toUpperCase() || "PENDING"}
- Health Score: ${health.score ?? farm.latestHealth?.score ?? "N/A"}/100
- Assessment Confidence: ${health.confidence || "medium"}
- Primary Algorithmic Observations: ${health.reasons?.join("; ") || "Standard baseline"}

LATEST MULTISPECTRAL OBSERVATION (${latestObs?.obsDate ? new Date(latestObs.obsDate).toISOString().slice(0, 10) : "Recent"}):
- NDVI Mean (Biomass Density): ${latestObs?.ndviMean != null ? latestObs.ndviMean.toFixed(4) : "N/A"}
- NDRE Mean (Chlorophyll State): ${latestObs?.ndreMean != null ? latestObs.ndreMean.toFixed(4) : "N/A"}
- NDMI Mean (Canopy Moisture): ${latestObs?.ndmiMean != null ? latestObs.ndmiMean.toFixed(4) : "N/A"}
- Valid Pixel Clarity: ${latestObs?.validPixels != null ? `${latestObs.validPixels} clear pixels` : "N/A"}

PHENOLOGY & SEASONAL CALENDAR:
- Maturity Stage: ${phenology.maturityStage || "Mature Productive"}
- Seasonal Phase: ${phenology.season || "Active Season"}
- 20-Day Trend Direction: ${phenology.trend || "stable"}

ACTIVE ALERTS (${alerts.length}):
${alerts.length > 0 ? alerts.map((a) => `- [${a.severity?.toUpperCase()}] ${a.type}: ${a.message}`).join("\n") : "None active. Crop within stable boundaries."}
`;

  const promptText = userQuery
    ? `The farmer/manager has asked this specific question about their farm:
"${userQuery}"

Based on the farm's satellite telemetry data below, provide an authoritative, practical answer with specific recommendations:
${farmSummary}`
    : `Please analyze this farm's satellite telemetry data and provide a comprehensive Agronomic Advisory Report:

${farmSummary}

Structure your report into these clear sections:
1. 🌾 **Executive Diagnostic Summary**: Quick plain-language evaluation of canopy vigor, chlorophyll, and water stress.
2. 🛰️ **Spectral Telemetry Breakdown**: Explain what the current NDVI, NDRE, and NDMI numbers signify for this specific crop and tree age.
3. ⚠️ **Risk Assessment & Environmental Factors**: Flag any active alerts, Harmattan drought exposure, or canopy patchiness.
4. 📋 **Prioritized 14-Day Action Plan**: Concrete field tasks (e.g. soil cover, shade tree regulation, pruning, sanitation, pest scouting).
5. 💡 **Seasonal Outlook**: What the farmer should anticipate over the next 4–8 weeks based on the West African crop calendar.`;

  const contents = [
    {
      role: "user",
      parts: [{ text: promptText }],
    },
  ];

  return callGemini(contents);
}

/**
 * Interactive Chat with AI Agronomist
 */
export async function chatWithAi({ messages = [], ragContext = null, farmContext = null, orgContext = null }) {
  let contextIntro = "";

  if (ragContext?.ragPromptText) {
    contextIntro += `\n${ragContext.ragPromptText}\n`;
  }

  if (farmContext && !ragContext?.focusedFarm) {
    contextIntro += `\nCURRENT ACTIVE FARM CONTEXT:\n- Name: ${farmContext.name}\n- Crop: ${farmContext.cropType || "Cocoa"}\n- Area: ${farmContext.areaHa} ha\n- Health: ${farmContext.latestHealth?.status} (${farmContext.latestHealth?.score}/100)\n- Location: Centroid ${farmContext.centroid?.coordinates?.join(", ")}\n`;
  }

  if (orgContext) {
    contextIntro += `\nCURRENT ORGANIZATION CONTEXT:\n- Organization: ${orgContext.name}\n- Total Farms: ${orgContext.stats?.totalFarms || 0}\n- Total Area: ${orgContext.stats?.totalAreaHa || 0} ha\n- Farms at Risk: ${orgContext.stats?.atRiskCount || 0}\n`;
  }

  const systemPrompt = SYSTEM_INSTRUCTION + (contextIntro ? `\n${contextIntro}` : "");

  // Format messages for Gemini API
  const formattedContents = messages.map((m) => ({
    role: m.role === "assistant" || m.role === "model" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // Ensure first message has role user
  if (formattedContents.length > 0 && formattedContents[0].role !== "user") {
    formattedContents.unshift({
      role: "user",
      parts: [{ text: "Hello, I am using FarmTrack for satellite crop monitoring." }],
    });
  }

  return callGemini(formattedContents, systemPrompt);
}
