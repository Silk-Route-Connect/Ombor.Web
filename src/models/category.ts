/**
 * Target v1 contract for the Categories resource. The real backend's CategoryDto
 * is stale at the page level — it lacks productCount, the Default Category
 * concept, and reference-checked delete — so the whole resource is mocked at this
 * shape (docs/mocking.md, shape-of-truth rule). This type is the future backend
 * spec. All list operations (search/sort/pagination) are client-side.
 */
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
