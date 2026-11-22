import { Router } from "express";
import authenticate from "../../middleware/auth";
import { userController } from "./user.controller";

const router = Router();

router.get("/me", authenticate, userController.getMyProfile);
router.patch("/me", authenticate, userController.updateMyProfile);
router.get("/:userId", userController.getPublicProfile);

export const userRoute = router;
