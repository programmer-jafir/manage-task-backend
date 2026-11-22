import { Router } from "express";
import authenticate from "../../middleware/auth";
import { organizationsController } from "./organizations.controller";

const router = Router();

router.get("/", authenticate, organizationsController.getMyOrganizations);
router.get("/:orgId", authenticate, organizationsController.getOrganizationById);
router.post("/", authenticate, organizationsController.createOrganization);
router.patch("/:orgId", authenticate, organizationsController.updateOrganization);
router.delete("/:orgId", authenticate, organizationsController.deleteOrganization);

export const organizationRoute = router;
