import type { Request, Response } from "express";
import { CategoryService } from "../services/category.service.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/menu.validator.js";
import { ValidationError } from "../utils/errors.js";

type CategoryParams = {
  id: string;
};

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  // ---------------- Helper ----------------
  private parseId(id: string): number {
    const parsedId = Number(id);

    if (isNaN(parsedId)) {
      throw new ValidationError("Invalid category id");
    }

    return parsedId;
  }

  // ---------------- Get All Categories ----------------
  getAllCategories = async (req: Request, res: Response): Promise<void> => {
    const categories = await this.categoryService.getAllCategories();

    res.json({
      status: "success",
      data: categories,
    });
  };

  // ---------------- Get Single Category ----------------
  getCategoryById = async (
    req: Request<CategoryParams>,
    res: Response,
  ): Promise<void> => {
    const id = this.parseId(req.params.id);

    const category = await this.categoryService.getCategoryById(id);

    res.json({
      status: "success",
      data: category,
    });
  };

  // ---------------- Create Category ----------------
  createCategory = async (req: Request, res: Response): Promise<void> => {
    const validationResult = createCategorySchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0]?.message);
    }

    const category = await this.categoryService.createCategory(
      validationResult.data,
    );

    res.status(201).json({
      status: "success",
      data: category,
    });
  };

  // ---------------- Update Category ----------------
  updateCategory = async (
    req: Request<CategoryParams>,
    res: Response,
  ): Promise<void> => {
    const id = this.parseId(req.params.id);

    const validationResult = updateCategorySchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0]?.message);
    }

    const category = await this.categoryService.updateCategory(
      id,
      validationResult.data,
    );

    res.json({
      status: "success",
      data: category,
    });
  };

  // ---------------- Delete Category ----------------
  deleteCategory = async (
    req: Request<CategoryParams>,
    res: Response,
  ): Promise<void> => {
    const id = this.parseId(req.params.id);

    await this.categoryService.deleteCategory(id);

    res.json({
      status: "success",
      message: "Category deleted successfully",
    });
  };
}
