import Organization from "../models/organization.model.js";
import Membership from "../models/membership.model.js";

/**
 * Middleware to check if the authenticated user has an acceptable role in the organization.
 * @param {string[]} allowedRoles - Array of roles e.g. ["owner", "admin"] or ["owner", "admin", "manager"]
 */
export function requireOrgRole(allowedRoles = ["owner", "admin", "manager", "viewer"]) {
  return async (req, res, next) => {
    try {
      const orgId = req.params.orgId || req.params.id || req.body.orgId || req.query.orgId;
      if (!orgId) {
        return res.status(400).json({ error: "Organization ID is required" });
      }

      const org = await Organization.findById(orgId);
      if (!org) {
        return res.status(404).json({ error: "Organization not found" });
      }

      // Check if user is the direct owner of the organization
      if (org.ownerId.toString() === req.user._id.toString()) {
        req.org = org;
        req.orgRole = "owner";
        return next();
      }

      // Check active membership
      const membership = await Membership.findOne({
        orgId,
        userId: req.user._id,
        status: "active",
      });

      if (!membership) {
        return res.status(403).json({ error: "Access denied: Not a member of this organization" });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          error: `Access denied: Insufficient permissions. Required: ${allowedRoles.join(", ")}`,
        });
      }

      req.org = org;
      req.membership = membership;
      req.orgRole = membership.role;
      next();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };
}
