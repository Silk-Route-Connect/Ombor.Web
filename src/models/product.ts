import { TransactionType } from "./transaction";

export const PRODUCT_MEASUREMENTS = ["Unit", "Gram", "Kilogram", "Liter", "None"] as const;
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
export type ProductInventoryItem = {
	inventoryId: number;
	inventoryName: string;
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
	/** Dormant field — carried in the contract, never surfaced in the UI (canon). */
	retailPrice: number;

	measurement: Measurement;
	type: ProductType;

	lowStockThreshold?: number | null;
	isLowStock: boolean;
	isArchived: boolean;

	packaging?: ProductPackaging;
	images: ProductImage[];

	inventoryItems: ProductInventoryItem[];
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
	retailPrice: number;

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
	/** Signed quantity in base units: positive into stock, negative out. */
	quantity: number;
	unitPrice: number;
	discount: number;
};

/** A stock movement in the product's warehouse ledger. */
export type ProductMovementKind = TransactionType;

export type ProductMovement = {
	id: number;
	productId: number;
	/** ISO date string. */
	date: string;
	kind: ProductMovementKind;
	inventoryId: number;
	inventoryName: string;
	/** Signed delta in base units: positive into stock, negative out. */
	quantity: number;
	/** Served running total across all warehouses after this movement (hard rule 8). */
	balanceAfter: number;
};
