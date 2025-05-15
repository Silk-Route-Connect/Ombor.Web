export type Category = {
	id: number;
	name: string;
	description: string;
};

export type CreateCategoryRequest = {
	name: string;
	description: string;
};

export type UpdateCategoryRequest = Category;

export type GetCategoriesRequest = {
	searchTerm?: string;
};
