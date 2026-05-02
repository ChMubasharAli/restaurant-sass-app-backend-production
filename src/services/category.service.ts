import type { CreateCategoryDTO, UpdateCategoryDTO } from "../dto/menu.dto.js";
import { CategoryRepository } from "../repositories/category.repository.js";
import { NotFoundError, ConflictError } from "../utils/errors.js";

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async getAllCategories() {
    return this.categoryRepository.findAll();
  }

  async getCategoryById(id: number) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    return category;
  }

  async createCategory(data: CreateCategoryDTO) {
    return this.categoryRepository.create(data);
  }

  async updateCategory(id: number, data: UpdateCategoryDTO) {
    await this.getCategoryById(id);
    return this.categoryRepository.update(id, data);
  }

  async deleteCategory(id: number) {
    await this.getCategoryById(id);
    return this.categoryRepository.delete(id);
  }
}
