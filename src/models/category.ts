/**
 * Target v1 contract for the Categories resource. The real backend's CategoryDto
 * is stale at the page level — it lacks productCount and reference-checked
 * delete — so the whole resource is mocked at this shape (docs/mocking.md,
 * shape-of-truth rule). This type is the future backend spec. All list
 * operations (search/sort/pagination) are client-side.
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
