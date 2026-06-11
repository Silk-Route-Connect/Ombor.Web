/**
 * Standard server-side paging envelope. Every list endpoint in the redesigned
 * API returns this shape (server-side paging is a planned backend change —
 * see docs/mocking.md). `page` is 1-based.
 */
export interface PagedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
}

/** Query params shared by every paged list endpoint. */
export type PagedRequest = {
	page?: number;
	pageSize?: number;
	search?: string;
};
