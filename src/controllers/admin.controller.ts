import type { Request, Response } from "express";
import { AdminService } from "../services/admin.service.js";
import {
  adminLoginSchema,
  changePasswordSchema,
} from "../validators/admin.validator.js";
import { ValidationError } from "../utils/errors.js";

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  // Admin Login
  login = async (req: Request, res: Response) => {
    const validationResult = adminLoginSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ValidationError(
        validationResult.error.issues[0]?.message || "Validation failed",
      );
    }

    const { username, password } = validationResult.data;
    const adminData = await this.adminService.login(username, password);

    res.json({
      status: "success",
      data: adminData,
    });
  };

  // Change Password
  changePassword = async (req: Request, res: Response) => {
    const validationResult = changePasswordSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ValidationError(
        validationResult.error.issues[0]?.message || "Validation failed",
      );
    }

    // In a real app with JWT, we'd get admin ID from token
    // For now, we'll get admin ID from request body or session
    const adminId = parseInt(req.body.adminId) || 1; // Default to first admin if no JWT

    const { currentPassword, newPassword, confirmPassword } =
      validationResult.data;
    const result = await this.adminService.changePassword(
      adminId,
      currentPassword,
      newPassword,
      confirmPassword,
    );

    res.json({
      status: "success",
      data: result,
    });
  };

  // Verify admin session/credentials
  verifyAdmin = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new ValidationError("Username and password are required");
    }

    // Verify credentials
    await this.adminService.login(username, password);

    res.json({
      status: "success",
      message: "Admin verified successfully",
      data: {
        isAdmin: true,
        username: username,
      },
    });
  };
}
