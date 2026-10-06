/**
 * Global search — one call over partners, products, documents, employees,
 * warehouses and wallets (`GET /api/search`, backend-contracts/search.md).
 */
import { ActivityEntityKind } from "./activity";

export type SearchRequest = {
	/** 1–100 characters, trimmed by the server. */
	q: string;
	/** The most records per group, 1–20 (server default 5). */
	limit?: number;
};

/** The field a hit matched on — the best one when several match. */
export type SearchMatch =
	| "Name"
	| "Company"
	| "Phone"
	| "Sku"
	| "Barcode"
	| "PackagingBarcode"
	| "Number";

export type SearchHit = {
	/** The record kind in the Activity Log's vocabulary — it also names the page to open. */
	entityKind: ActivityEntityKind;
	id: number;
	/** The name; for a document its bare number (the client prepends «№»). */
	label: string;
	/** SKU, company or first phone, position, location, or a document's partner / employee. */
	detail?: string | null;
	matchedOn: SearchMatch;
	/** Archived (an employee: terminated); documents never are. */
	isArchived: boolean;
	/** Documents only: the document date. */
	date?: string | null;
	/** Documents only: the total due, the payment amount or the order total. */
	amount?: number | null;
};

export type SearchGroup = {
	/** How many records match — `items` holds the best `limit` of them. */
	total: number;
	items: SearchHit[];
};

export const SEARCH_GROUP_KEYS = [
	"partners",
	"products",
	"documents",
	"employees",
	"warehouses",
	"wallets",
] as const;

export type SearchGroupKey = (typeof SEARCH_GROUP_KEYS)[number];

export type SearchResults = Record<SearchGroupKey, SearchGroup> & {
	/** The query as the server received it, trimmed. */
	query: string;
};
