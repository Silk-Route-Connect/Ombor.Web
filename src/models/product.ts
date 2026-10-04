import { TransactionLineDiscountType, TransactionType } from "./transaction";

// `Unit` duplicates `Piece`; removed from the product picker + default (2026-07-16).
// Kept in the type because the backend still serves it for legacy products — the
// migration to `Piece` is tracked in issues-tracker §12, and the edit form normalizes
// a served `Unit` to `Piece` (see `mapProductToFormPayload`).
export const PRODUCT_MEASUREMENTS = [
	"Gram",
	"Kilogram",
	"Ton",
	"Piece",
	"Box",
	"Unit",
	"None",
] as const;
export type Measurement = (typeof PRODUCT_MEASUREMENTS)[number];

export const PRODUCT_TYPES = ["All", "Sale", "Supply"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export type ProductImage = {
	id: number;
	name: string;
	originalUrl: string;
	thumbnailUrl?: string;
};

export type ProductPackaging = {
	size: number;
	label: string | null;
	barcode: string | null;
};

/**
 * One warehouse's holding of a product. `quantity` and `averageCost` are
 * served by the backend (hard rule 8): `averageCost` is the warehouse-local
 * value-weighted unit cost (WAC), never recomputed client-side.
 */
export type ProductWarehouseItem = {
	warehouseId: number;
	warehouseName: string;
	quantity: number;
	averageCost: number;
};

export type Product = {
	id: number;
	/** Category is optional in v1 (no default-category concept — canon rule 42). */
	categoryId: number | null;
	categoryName: string | null;
	name: string;
	sku: string;
	description?: string;
	barcode?: string;

	salePrice: number;
	supplyPrice: number;
	/**
	 * Dormant, read-only field. Removed from the create/edit contract (the form no
	 * longer collects or sends it); still served by the backend from the entity and
	 * never surfaced in the UI. Pending full removal from the contract backend-side.
	 */
	retailPrice: number;

	measurement: Measurement;
	type: ProductType;

	lowStockThreshold?: number | null;
	isLowStock: boolean;
	isArchived: boolean;
	/** Served: false once any stock movement or document references the product (DELETE then returns 409). */
	isDeletable: boolean;

	packaging?: ProductPackaging;
	images: ProductImage[];

	warehouseItems: ProductWarehouseItem[];
	/** Served sum of quantities across warehouses (hard rule 8). */
	totalStock: number;
	/**
	 * Served value-weighted WAC across warehouses; null when there is no stock.
	 * Surfaced on the product detail page only (list shows no WAC column).
	 */
	averageCost: number | null;
};

export type CreateProductRequest = {
	categoryId: number | null;
	name: string;
	sku: string;
	description?: string;
	barcode?: string;

	salePrice: number;
	supplyPrice: number;

	measurement: Measurement;
	type: ProductType;

	lowStockThreshold?: number | null;

	packaging?: ProductPackaging;
	attachments?: File[];
};

export type UpdateProductRequest = CreateProductRequest & {
	id: number;
	imagesToDelete?: number[];
};

export type ProductTransaction = {
	id: number;
	productId: number;
	transactionType: TransactionType;
	partnerId: number;
	partnerName: string;
	/** ISO date string. */
	date: string;
	/** Line quantity in base units as served (unsigned); the transaction type says in or out. */
	quantity: number;
	unitPrice: number;
	discount: number;
	/** How `discount` is read (rule 37); older API builds omit it. */
	discountType?: TransactionLineDiscountType;
	/** The document's bare number («42»; differs from `id`); null for a legacy row. */
	transactionNumber: string | null;
};

/**
 * A stock movement in the product's warehouse ledger. The backend serves `kind`
 * as a typed enum: the transaction kinds (Sale / Supply / SaleRefund /
 * SupplyRefund) plus `Opening` (initial stock), `Transfer` (inter-warehouse
 * move) and `Adjustment` (stock correction).
 */
export type ProductMovementKind = TransactionType | "Opening" | "Transfer" | "Adjustment";

/**
 * The document a stock movement belongs to — what its row opens: a sale /
 * supply / refund, a transfer, a stock adjustment or the opening-stock record.
 */
export type MovementSource = "Transaction" | "Transfer" | "StockAdjustment" | "OpeningStock";

/** Source-document fields every movement row carries (product and warehouse ledgers). */
export type MovementSourceRef = {
	kind: ProductMovementKind;
	sourceType: MovementSource;
	/** The document's id (the transaction, transfer, adjustment or opening record — not its line). */
	sourceId: number;
	/** The transaction's bare number on a `Transaction` row; null for other sources. */
	sourceNumber: string | null;
};

export type ProductMovement = MovementSourceRef & {
	/** The source line / event id — not routable; `sourceId` opens the document. */
	id: number;
	productId: number;
	/** ISO date string. */
	date: string;
	warehouseId: number;
	warehouseName: string;
	/** For a transfer row: the other warehouse; null otherwise. */
	counterpartyWarehouseId: number | null;
	counterpartyWarehouseName: string | null;
	/** Signed delta in base units: positive into stock, negative out. */
	quantity: number;
	/** Served running total across all warehouses after this movement (hard rule 8). */
	balanceAfter: number;
};
