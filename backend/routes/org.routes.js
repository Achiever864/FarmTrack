import { Router } from "express";
import {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  getOrgMembers,
  addOrgMember,
  updateOrgMemberRole,
  removeOrgMember,
  getOrgPortfolio,
  exportOrgPortfolioCsv,
  getOrgAlerts,
  updateAlert,
} from "../controllers/org.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireOrgRole } from "../middleware/org.middleware.js";

const router = Router();

// Protect all routes with JWT authentication
router.use(authenticate);

// Organization creation & listing
router.post("/", createOrganization);
router.get("/", getMyOrganizations);
router.get("/:id", getOrganizationById);

// Portfolio dashboard & CSV export
router.get("/:id/portfolio", requireOrgRole(["owner", "admin", "manager", "viewer"]), getOrgPortfolio);
router.get("/:id/portfolio/export", requireOrgRole(["owner", "admin", "manager", "viewer"]), exportOrgPortfolioCsv);

// Member management
router.get("/:id/members", requireOrgRole(["owner", "admin", "manager", "viewer"]), getOrgMembers);
router.post("/:id/members", requireOrgRole(["owner", "admin"]), addOrgMember);
router.patch("/:id/members/:userId", requireOrgRole(["owner", "admin"]), updateOrgMemberRole);
router.delete("/:id/members/:userId", requireOrgRole(["owner", "admin"]), removeOrgMember);

// Alerts inbox & acknowledgement
router.get("/:id/alerts", requireOrgRole(["owner", "admin", "manager", "viewer"]), getOrgAlerts);
router.patch("/alerts/:alertId", updateAlert);

export default router;
