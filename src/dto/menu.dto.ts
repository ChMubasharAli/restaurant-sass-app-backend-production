export interface CreateCategoryDTO {
  name: string;
  description?: string | undefined;
  sortOrder?: number | undefined;
}

export interface UpdateCategoryDTO {
  name?: string | undefined;
  description?: string | undefined;
  sortOrder?: number | undefined;
}

export interface CreateMenuItemDTO {
  name: string;
  description: string;
  price: number;
  image?: string | undefined;
  isAvailable?: boolean | undefined;
  categoryId: number;
}

export interface UpdateMenuItemDTO {
  name?: string | undefined;
  description?: string | undefined;
  price?: number | undefined;
  image?: string | undefined;
  isAvailable?: boolean | undefined;
  categoryId?: number | undefined;
}
