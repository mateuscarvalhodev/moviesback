import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";

export const router = Router();

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/refresh", authController.refresh);
router.delete("/auth/logout", authController.logout);
