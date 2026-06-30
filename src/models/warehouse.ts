import { Measurement } from "./product";

/**
 * Warehouse (the backend's "Inventory") — the redesigned «Склады» resource.
 * The stale `/api/inventories` contract carries only name/location/isActive and
 * hard-deletes; the redesigned pages need served aggregates, archive/restore and
 * a movements ledger, so the whole resource is mocked at this target v1 contract
 * under `/api/warehouses` (docs/mocking.md). The legacy `/api/inventories`
 * consumers (sale/supply stock pickers) are left untouched.
 */
export type Warehouse = {
	id: number;
	name: string;
	/** Free-text address (the backend's `location`); optional. */
	location: string | null;

	/**
	 * Server-computed aggregates (hard rule 8) — never recomputed client-side.
	 * An archived warehouse that still holds stock still reports them (rule 31).
	 */
	/** Distinct products currently held. */
	productCount: number;
	/** Total units across all products. */
	totalUnits: number;
	/** Total value of stock on hand at weighted-average cost (WAC). */
	stockValue: number;

	isArchived: boolean;

	/**
	 * True when no other entity references the warehouse, so it may be
	 * hard-deleted (business-rules rule 32 — a warehouse with stock / movement /
	 * transfer / transaction history is never hard-deleted, only archived).
	 * Mirrors {@link Partner.isDeletable}; computed server-side (hard rule 8).
	 */
	isDeletable: boolean;
};

/** One product's holding in a warehouse — the «Остатки» (stock) tab row. */
export type WarehouseStockItem = {
	productId: number;
	productName: string;
	sku: string;
	categoryName: string | null;
	measurement: Measurement;
	quantity: number;
	/** Warehouse-local weighted-average cost (served, hard rule 8). */
	averageCost: number;
	/** quantity × averageCost (served). */
	value: number;
};

/**
 * Kinds of stock movement in a warehouse ledger. Beyond the four transaction
 * types, the warehouse ledger also records opening stock, stock adjustments and
 * inter-warehouse transfers (business-rules §D, stock-in / stock-out events).
 */
export const WAREHOUSE_MOVEMENT_KINDS = [
	"Opening",
	"Supply",
	"Sale",
	"Refund",
	"Adjustment",
	"Transfer",
] as const;
export type WarehouseMovementKind = (typeof WAREHOUSE_MOVEMENT_KINDS)[number];

/** A single stock event in a warehouse's movements ledger (newest first). */
export type WarehouseMovement = {
	id: number;
	/** ISO date string. */
	date: string;
	kind: WarehouseMovementKind;
	productId: number;
	productName: string;
	measurement: Measurement;
	/**
	 * Counterparty / direction shown in the «Контрагент / направление» column:
	 * a partner name (Supply / Sale / Refund) or a transfer direction
	 * («→ Склад Чиланзар»). Null for partner-less events (adjustments / opening).
	 */
	counterparty: string | null;
	/**
	 * For Transfer events: the id of the other warehouse, so the counterparty cell
	 * can deep-link to it (WH-26). Optional — the current backend serves
	 * `counterparty` only as free text with no id, so this is null until the
	 * backend adds it; the cell falls back to plain text meanwhile.
	 */
	counterpartyWarehouseId?: number | null;
	/** Free-text note (adjustment reason, opening-stock note). */
	note: string | null;
	/** Signed delta in the product's base unit: positive into stock, negative out. */
	quantity: number;
	/** Served running balance of this product in this warehouse after the event. */
	balanceAfter: number;
};

export type CreateWarehouseRequest = {
	name: string;
	location: string | null;
};

export type UpdateWarehouseRequest = CreateWarehouseRequest & {
	id: number;
};

/** One opening-stock line (mirrors the backend's OpeningStockLine). */
export type OpeningStockLine = {
	productId: number;
	quantity: number;
	unitCost: number;
};

/**
 * Opening-stock event payload (mirrors AddOpeningStockRequest). The redesigned
 * modal submits a single line; the contract carries a list so it can grow to a
 * multi-line entry later. `warehouseId` is required by the backend and must match
 * the route id. The `note` rides along for the audit trail (rule 22/26).
 */
export type AddOpeningStockRequest = {
	warehouseId: number;
	items: OpeningStockLine[];
	note: string | null;
};
