import type { CreateCategoryDTO, UpdateCategoryDTO } from "../dto/menu.dto.js";
import { BaseRepository } from "./base.repository.js";

export class CategoryRepository extends BaseRepository {
  async findAll() {
    try {
      return await this.prisma.category.findMany({
        include: {
          _count: {
            select: { menuItems: true },
          },
        },
        orderBy: { sortOrder: "asc" },
      });
    } catch (error) {
      this.handleError(error, "CategoryRepository.findAll");
    }
  }

  async findById(id: number) {
    try {
      return await this.prisma.category.findUnique({
        where: { id },
        include: {
          menuItems: true,
        },
      });
    } catch (error) {
      this.handleError(error, "CategoryRepository.findById");
    }
  }

  async create(data: CreateCategoryDTO) {
    try {
      return await this.prisma.category.create({
        data: {
          name: data.name,
          description: data.description ?? null,
          sortOrder: data.sortOrder ?? 0,
          updatedAt: new Date(), // ✅ ADD THIS
        },
      });
    } catch (error) {
      this.handleError(error, "CategoryRepository.create");
    }
  }

  async update(id: number, data: UpdateCategoryDTO) {
    try {
      return await this.prisma.category.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handleError(error, "CategoryRepository.update");
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, "CategoryRepository.delete");
    }
  }
}
