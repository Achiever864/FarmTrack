import Farm from "../models/farm.model.js";
import Observation from "../models/observation.model.js";
import Alert from "../models/alert.model.js";
import Membership from "../models/membership.model.js";
import Organization from "../models/organization.model.js";
import { validatePolygon } from "../utils/geo.js";
import { enqueueFarmBackfill } from "../services/sync.service.js";
import { computeFarmHealth } from "../services/analysis/health.service.js";
import { computePhenology } from "../services/analysis/phenology.service.js";

/**
 * Creates a new farm and triggers asynchronous historical backfill.
 */
export async function createFarm(req, res) {
  try {
    const {
      name,
      geometry,
      cropType = "cocoa",
      plantingDate,
      treeAgeYears,
      tags = [],
      farmerName,
      assignedTo,
      orgId,
    } = req.body;

    if (!name || !geometry) {
      return res.status(400).json({ error: "Farm name and geometry are required" });
    }

    // Validate GeoJSON polygon
    const validation = validatePolygon(geometry);
    if (!validation.valid) {
      return res.status(400).json({ error: `Invalid polygon: ${validation.error}` });
    }

    let ownerType = "user";
    let ownerId = req.user._id;
    let targetOrgId = null;

    if (orgId) {
      // Verify user has role in org (owner, admin, manager)
      const org = await Organization.findById(orgId);
      if (!org) return res.status(404).json({ error: "Organization not found" });

      const isOrgOwner = org.ownerId.toString() === req.user._id.toString();
      if (!isOrgOwner) {
        const mem = await Membership.findOne({
          orgId,
          userId: req.user._id,
          status: "active",
        });
        if (!mem || !["owner", "admin", "manager"].includes(mem.role)) {
          return res.status(403).json({ error: "Permission denied: Cannot add farms to this organization" });
        }
      }

      ownerType = "organization";
      targetOrgId = orgId;
      ownerId = null;
    }

    const farm = await Farm.create({
      name: name.trim(),
      ownerType,
      ownerId,
      orgId: targetOrgId,
      geometry,
      areaHa: validation.areaHa,
      centroid: {
        type: "Point",
        coordinates: validation.centroid,
      },
      cropType,
      plantingDate: plantingDate ? new Date(plantingDate) : null,
      treeAgeYears: treeAgeYears != null ? Number(treeAgeYears) : null,
      tags: Array.isArray(tags) ? tags.map((t) => t.trim()) : [],
      farmerName: farmerName ? farmerName.trim() : null,
      assignedTo: assignedTo || null,
      backfillStatus: "pending",
      latestHealth: {
        status: "insufficient_data",
        score: null,
        confidence: "low",
        reasons: ["Backfill queued. Historical satellite observations are being retrieved."],
      },
    });

    // Enqueue async backfill
    enqueueFarmBackfill(farm._id);

    res.status(201).json(farm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Lists farms with pagination, searching, and filtering.
 */
export async function getFarms(req, res) {
  try {
    const {
      orgId,
      page = 1,
      limit = 20,
      search,
      status,
      cropType,
      tag,
      assignedTo,
    } = req.query;

    const query = {};

    if (orgId) {
      // Verify user has access to org
      const hasAccess = await userHasOrgAccess(req.user._id, orgId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to organization farms" });
      }
      query.orgId = orgId;
      query.ownerType = "organization";
    } else {
      // Individual mode: show farms directly owned by user
      query.ownerId = req.user._id;
      query.ownerType = "user";
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (status) {
      query["latestHealth.status"] = status;
    }
    if (cropType) {
      query.cropType = cropType;
    }
    if (tag) {
      query.tags = tag;
    }
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Farm.countDocuments(query);
    const farms = await Farm.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      farms,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Retrieves details of a single farm.
 */
export async function getFarmById(req, res) {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ error: "Farm not found" });

    const authorized = await userCanAccessFarm(req.user._id, farm);
    if (!authorized) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(farm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Updates farm details.
 */
export async function updateFarm(req, res) {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ error: "Farm not found" });

    const canEdit = await userCanManageFarm(req.user._id, farm);
    if (!canEdit) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const {
      name,
      geometry,
      cropType,
      plantingDate,
      treeAgeYears,
      tags,
      farmerName,
      assignedTo,
    } = req.body;

    if (name) farm.name = name.trim();
    if (cropType) farm.cropType = cropType;
    if (plantingDate !== undefined) farm.plantingDate = plantingDate ? new Date(plantingDate) : null;
    if (treeAgeYears !== undefined) farm.treeAgeYears = treeAgeYears != null ? Number(treeAgeYears) : null;
    if (tags !== undefined) farm.tags = Array.isArray(tags) ? tags.map((t) => t.trim()) : [];
    if (farmerName !== undefined) farm.farmerName = farmerName ? farmerName.trim() : null;
    if (assignedTo !== undefined) farm.assignedTo = assignedTo || null;

    if (geometry) {
      const validation = validatePolygon(geometry);
      if (!validation.valid) {
        return res.status(400).json({ error: `Invalid polygon: ${validation.error}` });
      }
      farm.geometry = geometry;
      farm.areaHa = validation.areaHa;
      farm.centroid = { type: "Point", coordinates: validation.centroid };
      // Re-queue backfill for new boundary
      farm.backfillStatus = "pending";
      enqueueFarmBackfill(farm._id);
    }

    await farm.save();
    res.json(farm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Deletes a farm and cascades deletion of observations and alerts.
 */
export async function deleteFarm(req, res) {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ error: "Farm not found" });

    const canDelete = await userCanManageFarm(req.user._id, farm, ["owner", "admin"]);
    if (!canDelete) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Cascade delete observations & alerts
    await Observation.deleteMany({ farmId: farm._id });
    await Alert.deleteMany({ farmId: farm._id });
    await Farm.findByIdAndDelete(farm._id);

    res.json({ message: "Farm and associated satellite records deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Returns observations for charting (time-series).
 */
export async function getFarmTimeseries(req, res) {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ error: "Farm not found" });

    const authorized = await userCanAccessFarm(req.user._id, farm);
    if (!authorized) return res.status(403).json({ error: "Access denied" });

    const observations = await Observation.find({ farmId: farm._id })
      .sort({ obsDate: 1 })
      .lean();

    res.json(observations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Returns deep inference analysis (health, phenology, alerts) for a farm.
 */
export async function getFarmAnalysis(req, res) {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ error: "Farm not found" });

    const authorized = await userCanAccessFarm(req.user._id, farm);
    if (!authorized) return res.status(403).json({ error: "Access denied" });

    const observations = await Observation.find({ farmId: farm._id })
      .sort({ obsDate: 1 })
      .lean();

    const health = await computeFarmHealth(farm, observations);
    const phenology = computePhenology(farm, observations);
    const alerts = await Alert.find({ farmId: farm._id, resolvedAt: null }).sort({ createdAt: -1 });

    res.json({
      health,
      phenology,
      alerts,
      observationCount: observations.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Bulk import of farms via GeoJSON FeatureCollection or rows array.
 */
export async function bulkImportFarms(req, res) {
  try {
    const { orgId, features, items } = req.body;

    if (!orgId) return res.status(400).json({ error: "orgId is required for bulk import" });

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ error: "Organization not found" });

    const canImport = await userCanManageOrg(req.user._id, orgId, ["owner", "admin", "manager"]);
    if (!canImport) return res.status(403).json({ error: "Permission denied for bulk import" });

    const toProcess = [];

    // Format 1: GeoJSON FeatureCollection
    if (Array.isArray(features)) {
      for (const feat of features) {
        toProcess.push({
          name: feat.properties?.name || feat.properties?.title || "Imported Farm",
          geometry: feat.geometry,
          cropType: feat.properties?.cropType || "cocoa",
          plantingDate: feat.properties?.plantingDate,
          treeAgeYears: feat.properties?.treeAgeYears,
          tags: feat.properties?.tags ? String(feat.properties.tags).split(",").map((s) => s.trim()) : [],
          farmerName: feat.properties?.farmerName,
        });
      }
    } else if (Array.isArray(items)) {
      // Format 2: JSON array
      toProcess.push(...items);
    } else {
      return res.status(400).json({ error: "Invalid payload: provide 'features' (GeoJSON) or 'items' array" });
    }

    const accepted = [];
    const rejected = [];

    for (let i = 0; i < toProcess.length; i++) {
      const row = toProcess[i];
      const validation = validatePolygon(row.geometry);

      if (!validation.valid) {
        rejected.push({ index: i, name: row.name, reason: validation.error });
        continue;
      }

      try {
        const farm = await Farm.create({
          name: row.name || `Imported Farm ${i + 1}`,
          ownerType: "organization",
          orgId,
          geometry: row.geometry,
          areaHa: validation.areaHa,
          centroid: { type: "Point", coordinates: validation.centroid },
          cropType: row.cropType || "cocoa",
          plantingDate: row.plantingDate ? new Date(row.plantingDate) : null,
          treeAgeYears: row.treeAgeYears != null ? Number(row.treeAgeYears) : null,
          tags: Array.isArray(row.tags) ? row.tags : [],
          farmerName: row.farmerName || null,
          backfillStatus: "pending",
          latestHealth: {
            status: "insufficient_data",
            confidence: "low",
            reasons: ["Backfill queued."],
          },
        });

        enqueueFarmBackfill(farm._id);
        accepted.push({ _id: farm._id, name: farm.name, areaHa: farm.areaHa });
      } catch (insertErr) {
        rejected.push({ index: i, name: row.name, reason: insertErr.message });
      }
    }

    res.json({
      message: `Bulk import completed: ${accepted.length} accepted, ${rejected.length} rejected`,
      total: toProcess.length,
      acceptedCount: accepted.length,
      rejectedCount: rejected.length,
      accepted,
      rejected,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Helper authorization functions
async function userHasOrgAccess(userId, orgId) {
  const org = await Organization.findById(orgId);
  if (!org) return false;
  if (org.ownerId.toString() === userId.toString()) return true;
  const mem = await Membership.findOne({ orgId, userId, status: "active" });
  return !!mem;
}

async function userCanAccessFarm(userId, farm) {
  if (farm.ownerType === "user") {
    return farm.ownerId.toString() === userId.toString();
  }
  return await userHasOrgAccess(userId, farm.orgId);
}

async function userCanManageFarm(userId, farm, allowedRoles = ["owner", "admin", "manager"]) {
  if (farm.ownerType === "user") {
    return farm.ownerId.toString() === userId.toString();
  }
  return await userCanManageOrg(userId, farm.orgId, allowedRoles);
}

async function userCanManageOrg(userId, orgId, allowedRoles) {
  const org = await Organization.findById(orgId);
  if (!org) return false;
  if (org.ownerId.toString() === userId.toString()) return true;
  const mem = await Membership.findOne({ orgId, userId, status: "active" });
  return mem && allowedRoles.includes(mem.role);
}
