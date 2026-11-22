import { Router } from "express";
import authenticate from "../../middleware/auth";
import { organizationsController } from "./organizations.controller";

const router = Router();

router.get("/", authenticate, organizationsController.getMyOrganizations);
router.get("/:orgId", authenticate, organizationsController.getOrganizationById);
router.post("/", authenticate, organizationsController.createOrganization);

export const organizationRoute = router;
