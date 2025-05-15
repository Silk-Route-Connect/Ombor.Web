export type Category = {
	id: number;
	name: string;
	description?: string;
};

export type CreateCategoryRequest = Omit<Category, "id">;

export type UpdateCategoryRequest = Category;

export type GetCategoriesRequest = {
	searchTerm?: string;
};
