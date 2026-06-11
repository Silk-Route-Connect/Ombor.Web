/**
 * Mirrors the backend CategoryDto (docs/openapi.json). The backend returns
 * plain arrays for the list endpoint; searching, sorting, and pagination are
 * all client-side in v1 (docs/mocking.md — client-side-operations rule).
 */
export type Category = {
	id: number;
	name: string;
	description?: string | null;
};

export type CreateCategoryRequest = {
	name: string;
	description?: string | null;
};

export type UpdateCategoryRequest = CreateCategoryRequest & {
	id: number;
};
