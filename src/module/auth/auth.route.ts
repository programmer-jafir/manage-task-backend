import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router()

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post('/refresh',authController.refreshToken)
router.post('/logout', authController.logoutUser)
// router.get('/me')
// router.post('/forgot-password')
// router.post('/reset-password')
// router.patch('/change-password')


export const authRoute= router;