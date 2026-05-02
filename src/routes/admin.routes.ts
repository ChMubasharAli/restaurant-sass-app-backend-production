import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const adminController = new AdminController();

// Public routes
router.post("/login", asyncHandler(adminController.login));
router.post("/verify", asyncHandler(adminController.verifyAdmin));
router.post("/change-password", asyncHandler(adminController.changePassword));

export { router as adminRoutes };
