import { BaseRepository } from "./base.repository.js";

export class AdminRepository extends BaseRepository {
  async findByUsername(username: string) {
    try {
      return await this.prisma.admin.findUnique({
        where: { username },
      });
    } catch (error) {
      this.handleError(error, "AdminRepository.findByUsername");
    }
  }

  async findById(id: number) {
    try {
      return await this.prisma.admin.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      this.handleError(error, "AdminRepository.findById");
    }
  }

  async updatePassword(id: number, hashedPassword: string) {
    try {
      return await this.prisma.admin.update({
        where: { id },
        data: {
          password: hashedPassword,
        },
        select: {
          id: true,
          username: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      this.handleError(error, "AdminRepository.updatePassword");
    }
  }
}
