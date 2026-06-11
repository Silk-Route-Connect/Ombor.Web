import { PagedRequest, PagedResponse } from "./pagination";

export type Category = {
	id: number;
	name: string;
	description?: string | null;
	/** Number of products referencing this category. Backend-computed. */
	productCount: number;
	/** System-created Default Category — backstops "Category required"; cannot be deleted. */
	isDefault: boolean;
};

export type CreateCategoryRequest = {
	name: string;
	description?: string | null;
};

export type UpdateCategoryRequest = CreateCategoryRequest & {
	id: number;
};

export type GetCategoriesRequest = PagedRequest;

export type GetCategoriesResponse = PagedResponse<Category>;
