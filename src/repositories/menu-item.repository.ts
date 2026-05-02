import type { CreateMenuItemDTO, UpdateMenuItemDTO } from "../dto/menu.dto.js";
import { BaseRepository } from "./base.repository.js";
export class MenuItemRepository extends BaseRepository {
  async findAll() {
    try {
      return await this.prisma.menuItem.findMany({
        include: {
          category: true,
        },
        orderBy: {
          name: "asc",
        },
      });
    } catch (error) {
      this.handleError(error, "MenuItemRepository.findAll");
    }
  }

  async findByCategory(categoryId: number) {
    try {
      return await this.prisma.menuItem.findMany({
        where: { categoryId },
        include: {
          category: true,
        },
        orderBy: {
          name: "asc",
        },
      });
    } catch (error) {
      this.handleError(error, "MenuItemRepository.findByCategory");
    }
  }

  async findAvailable() {
    try {
      return await this.prisma.menuItem.findMany({
        where: { isAvailable: true },
        include: {
          category: true,
        },
        orderBy: {
          name: "asc",
        },
      });
    } catch (error) {
      this.handleError(error, "MenuItemRepository.findAvailable");
    }
  }

  async findById(id: number) {
    try {
      return await this.prisma.menuItem.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });
    } catch (error) {
      this.handleError(error, "MenuItemRepository.findById");
    }
  }

  async create(data: CreateMenuItemDTO) {
    try {
      return await this.prisma.menuItem.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          image: data.image ?? null,
          isAvailable: data.isAvailable ?? true,
          categoryId: data.categoryId,
          updatedAt: new Date(), // ✅ ADD THIS
        },
      });
    } catch (error) {
      this.handleError(error, "MenuItemRepository.create");
    }
  }

  async update(id: number, data: UpdateMenuItemDTO) {
    try {
      return await this.prisma.menuItem.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handleError(error, "MenuItemRepository.update");
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.menuItem.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, "MenuItemRepository.delete");
    }
  }
}
