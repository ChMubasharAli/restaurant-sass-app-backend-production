import type { Request, Response } from "express";
import { MenuItemService } from "../services/menu-item.service.js";
import {
  createMenuItemSchema,
  updateMenuItemSchema,
} from "../validators/menu.validator.js";
import { ValidationError } from "../utils/errors.js";

export class MenuItemController {
  private menuItemService: MenuItemService;

  constructor() {
    this.menuItemService = new MenuItemService();
  }

  getAllMenuItems = async (req: Request, res: Response) => {
    const { categoryId, available } = req.query;

    let items;
    if (categoryId) {
      items = await this.menuItemService.getMenuItemsByCategory(
        parseInt(categoryId as string),
      );
    } else if (available === "true") {
      items = await this.menuItemService.getAvailableMenuItems();
    } else {
      items = await this.menuItemService.getAllMenuItems();
    }

    res.json({
      status: "success",
      data: items,
    });
  };

  getMenuItemById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const menuItem = await this.menuItemService.getMenuItemById(id);
    res.json({
      status: "success",
      data: menuItem,
    });
  };

  createMenuItem = async (req: Request, res: Response) => {
    const validationResult = createMenuItemSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0]?.message);
    }

    const menuItem = await this.menuItemService.createMenuItem(
      validationResult.data,
    );
    res.status(201).json({
      status: "success",
      data: menuItem,
    });
  };

  updateMenuItem = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const validationResult = updateMenuItemSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0]?.message);
    }

    const menuItem = await this.menuItemService.updateMenuItem(
      id,
      validationResult.data,
    );
    res.json({
      status: "success",
      data: menuItem,
    });
  };

  deleteMenuItem = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await this.menuItemService.deleteMenuItem(id);
    res.json({
      status: "success",
      message: "Menu item deleted successfully",
    });
  };

  toggleAvailability = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const menuItem = await this.menuItemService.toggleAvailability(id);
    res.json({
      status: "success",
      data: menuItem,
    });
  };
}
