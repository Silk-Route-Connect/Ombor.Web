export type Category = {
	id: number;
	name: string;
	description?: string;
};

export type CreateCategoryRequest = Omit<Category, "id">;

export type UpdateCategoryRequest = CreateCategoryRequest & {
	id: number;
};

export type GetCategoriesRequest = {
	searchTerm?: string;
};
