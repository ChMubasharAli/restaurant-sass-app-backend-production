import { AdminRepository } from "../repositories/admin.repository.js";
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "../utils/errors.js";
import * as crypto from "crypto";

export class AdminService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  // Hash password using SHA256
  private hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  // Verify password
  private verifyPassword(password: string, hashedPassword: string): boolean {
    const hash = this.hashPassword(password);
    return hash === hashedPassword;
  }

  // Admin login
  async login(username: string, password: string) {
    // Find admin by username
    const admin = await this.adminRepository.findByUsername(username);

    if (!admin) {
      throw new UnauthorizedError("Invalid username or password");
    }

    // Verify password
    const isValidPassword = this.verifyPassword(password, admin.password);

    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid username or password");
    }

    // Return admin data without password
    return {
      id: admin.id,
      username: admin.username,
      message: "Login successful",
    };
  }

  // Change password
  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    // Validate new password matches confirm password
    if (newPassword !== confirmPassword) {
      throw new ValidationError(
        "New password and confirm password do not match",
      );
    }

    // Validate password length
    if (newPassword.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long");
    }

    // Get admin
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    // Get full admin data with password
    const fullAdmin = await this.adminRepository.findByUsername(admin.username);
    if (!fullAdmin) {
      throw new NotFoundError("Admin not found");
    }

    // Verify current password
    const isCurrentPasswordValid = this.verifyPassword(
      currentPassword,
      fullAdmin.password,
    );
    if (!isCurrentPasswordValid) {
      throw new ValidationError("Current password is incorrect");
    }

    // Hash new password and update
    const hashedNewPassword = this.hashPassword(newPassword);
    const updatedAdmin = await this.adminRepository.updatePassword(
      id,
      hashedNewPassword,
    );

    return {
      ...updatedAdmin,
      message: "Password changed successfully",
    };
  }

  // Get admin profile
  async getProfile(id: number) {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundError("Admin not found");
    }
    return admin;
  }
}
