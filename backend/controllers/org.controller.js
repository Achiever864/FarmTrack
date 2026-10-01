import Organization from "../models/organization.model.js";
import Membership from "../models/membership.model.js";
import User from "../models/user.model.js";
import Farm from "../models/farm.model.js";
import Alert from "../models/alert.model.js";

/**
 * Creates a new organization. The creator becomes the owner.
 */
export async function createOrganization(req, res) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Organization name is required" });
    }

    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const org = await Organization.create({
      name: name.trim(),
      slug,
      ownerId: req.user._id,
    });

    // Create owner membership
    await Membership.create({
      orgId: org._id,
      userId: req.user._id,
      role: "owner",
      status: "active",
    });

    res.status(201).json({ org, role: "owner" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Lists all organizations the authenticated user belongs to.
 */
export async function getMyOrganizations(req, res) {
  try {
    const memberships = await Membership.find({
      userId: req.user._id,
      status: "active",
    })
      .populate("orgId")
      .lean();

    const orgs = memberships
      .filter((m) => m.orgId != null)
      .map((m) => ({
        ...m.orgId,
        userRole: m.role,
      }));

    res.json(orgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Retrieves details of a specific organization.
 */
export async function getOrganizationById(req, res) {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ error: "Organization not found" });

    // Check membership
    const membership = await Membership.findOne({
      orgId: org._id,
      userId: req.user._id,
      status: "active",
    });

    if (!membership && org.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    const membersCount = await Membership.countDocuments({
      orgId: org._id,
      status: "active",
    });
    const farmsCount = await Farm.countDocuments({ orgId: org._id });

    res.json({
      org,
      userRole: membership?.role || (org.ownerId.toString() === req.user._id.toString() ? "owner" : "viewer"),
      stats: { membersCount, farmsCount },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Lists members of an organization.
 */
export async function getOrgMembers(req, res) {
  try {
    const members = await Membership.find({ orgId: req.params.id })
      .populate("userId", "name email")
      .sort({ createdAt: 1 })
      .lean();

    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Invites or adds a member to the organization by email.
 */
export async function addOrgMember(req, res) {
  try {
    const { email, role = "viewer" } = req.body;
    if (!email) return res.status(400).json({ error: "Member email is required" });

    const targetUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!targetUser) {
      return res.status(404).json({
        error: `User with email "${email}" is not registered on FarmTrack yet. Please have them create an account first.`,
      });
    }

    const existing = await Membership.findOne({
      orgId: req.params.id,
      userId: targetUser._id,
    });

    if (existing) {
      return res.status(400).json({ error: "User is already a member of this organization" });
    }

    const membership = await Membership.create({
      orgId: req.params.id,
      userId: targetUser._id,
      role,
      invitedBy: req.user._id,
      status: "active",
    });

    res.status(201).json(membership);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Updates a member's role.
 */
export async function updateOrgMemberRole(req, res) {
  try {
    const { role } = req.body;
    const { id: orgId, userId } = req.params;

    if (!["admin", "manager", "viewer"].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    const membership = await Membership.findOneAndUpdate(
      { orgId, userId },
      { $set: { role } },
      { new: true }
    );

    if (!membership) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(membership);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Removes a member from an organization.
 */
export async function removeOrgMember(req, res) {
  try {
    const { id: orgId, userId } = req.params;

    const org = await Organization.findById(orgId);
    if (org && org.ownerId.toString() === userId.toString()) {
      return res.status(400).json({ error: "Cannot remove the owner of the organization" });
    }

    await Membership.findOneAndDelete({ orgId, userId });
    res.json({ message: "Member removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Portfolio Dashboard: Aggregate statistics, health breakdown, map points, and attention list.
 */
export async function getOrgPortfolio(req, res) {
  try {
    const orgId = req.params.id;

    const farms = await Farm.find({ orgId }).lean();

    const totalFarms = farms.length;
    const totalAreaHa =
      Math.round(farms.reduce((acc, f) => acc + (f.areaHa || 0), 0) * 100) / 100;

    const healthDistribution = {
      healthy: 0,
      watch: 0,
      at_risk: 0,
      insufficient_data: 0,
    };

    const attentionList = [];
    const mapFarms = [];

    for (const f of farms) {
      const status = f.latestHealth?.status || "insufficient_data";
      healthDistribution[status] = (healthDistribution[status] || 0) + 1;

      if (status === "at_risk" || status === "watch") {
        attentionList.push({
          _id: f._id,
          name: f.name,
          status,
          score: f.latestHealth?.score,
          areaHa: f.areaHa,
          reasons: f.latestHealth?.reasons || [],
          farmerName: f.farmerName,
          lastSyncedAt: f.lastSyncedAt,
        });
      }

      mapFarms.push({
        _id: f._id,
        name: f.name,
        centroid: f.centroid?.coordinates,
        status,
        score: f.latestHealth?.score,
        areaHa: f.areaHa,
        cropType: f.cropType,
      });
    }

    // Sort attention list: lowest score first
    attentionList.sort((a, b) => (a.score || 0) - (b.score || 0));

    // Recent active alerts
    const recentAlerts = await Alert.find({ orgId, resolvedAt: null })
      .populate("farmId", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      totalFarms,
      totalAreaHa,
      healthDistribution,
      attentionList: attentionList.slice(0, 15),
      mapFarms,
      recentAlerts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Exports organization portfolio to CSV format.
 */
export async function exportOrgPortfolioCsv(req, res) {
  try {
    const orgId = req.params.id;
    const org = await Organization.findById(orgId);
    const farms = await Farm.find({ orgId }).sort({ name: 1 }).lean();

    const headers = [
      "Farm ID",
      "Farm Name",
      "Crop",
      "Area (ha)",
      "Farmer Name",
      "Health Status",
      "Health Score",
      "Confidence",
      "Last Synced",
      "Tags",
    ];

    const rows = farms.map((f) => [
      f._id.toString(),
      `"${(f.name || "").replace(/"/g, '""')}"`,
      f.cropType || "cocoa",
      f.areaHa || 0,
      `"${(f.farmerName || "").replace(/"/g, '""')}"`,
      f.latestHealth?.status || "insufficient_data",
      f.latestHealth?.score != null ? f.latestHealth.score : "",
      f.latestHealth?.confidence || "",
      f.lastSyncedAt ? new Date(f.lastSyncedAt).toISOString().slice(0, 10) : "",
      `"${(f.tags || []).join(", ").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${org?.slug || "portfolio"}-farms-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Lists alerts for an organization.
 */
export async function getOrgAlerts(req, res) {
  try {
    const { status = "active", severity } = req.query;
    const query = { orgId: req.params.id };

    if (status === "active") {
      query.resolvedAt = null;
    } else if (status === "resolved") {
      query.resolvedAt = { $ne: null };
    }

    if (severity) {
      query.severity = severity;
    }

    const alerts = await Alert.find(query)
      .populate("farmId", "name cropType areaHa")
      .populate("acknowledgedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Acknowledges or resolves an alert.
 */
export async function updateAlert(req, res) {
  try {
    const { action } = req.body; // "acknowledge" | "resolve"

    const alert = await Alert.findById(req.params.alertId);
    if (!alert) return res.status(404).json({ error: "Alert not found" });

    if (action === "acknowledge") {
      alert.acknowledgedBy = req.user._id;
    } else if (action === "resolve") {
      alert.resolvedAt = new Date();
      alert.acknowledgedBy = req.user._id;
    }

    await alert.save();
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
