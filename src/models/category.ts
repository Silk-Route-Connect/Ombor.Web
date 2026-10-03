/**
 * The Categories resource (backend-contracts/products-categories.md), with the
 * served productCount and reference-checked delete. All list operations
 * (search/sort/pagination) are client-side.
 *
 * Categories are uniform entities (business-rules rule 42): no protected default
 * — deletable when unreferenced, blocked only while products reference them.
 */
export type Category = {
	id: number;
	name: string;
	description?: string | null;
	/** Number of products referencing this category. Backend-computed. */
	productCount: number;
};

export type CreateCategoryRequest = {
	name: string;
	description?: string | null;
};

export type UpdateCategoryRequest = CreateCategoryRequest & {
	id: number;
};
