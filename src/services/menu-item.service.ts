import type { CreateMenuItemDTO, UpdateMenuItemDTO } from "../dto/menu.dto.js";
import { MenuItemRepository } from "../repositories/menu-item.repository.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

export class MenuItemService {
  private menuItemRepository: MenuItemRepository;

  constructor() {
    this.menuItemRepository = new MenuItemRepository();
  }

  async getAllMenuItems() {
    return this.menuItemRepository.findAll();
  }

  async getMenuItemsByCategory(categoryId: number) {
    return this.menuItemRepository.findByCategory(categoryId);
  }

  async getAvailableMenuItems() {
    return this.menuItemRepository.findAvailable();
  }

  async getMenuItemById(id: number) {
    const menuItem = await this.menuItemRepository.findById(id);
    if (!menuItem) {
      throw new NotFoundError("Menu item not found");
    }
    return menuItem;
  }

  async createMenuItem(data: CreateMenuItemDTO) {
    return this.menuItemRepository.create(data);
  }

  async updateMenuItem(id: number, data: UpdateMenuItemDTO) {
    await this.getMenuItemById(id);
    return this.menuItemRepository.update(id, data);
  }

  async deleteMenuItem(id: number) {
    await this.getMenuItemById(id);
    return this.menuItemRepository.delete(id);
  }

  async toggleAvailability(id: number) {
    const menuItem = await this.getMenuItemById(id);
    return this.menuItemRepository.update(id, {
      isAvailable: !menuItem.isAvailable,
    });
  }
}
