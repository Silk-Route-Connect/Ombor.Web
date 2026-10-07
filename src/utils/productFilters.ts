import { Product } from "models/product";

import { matchesSearch } from "./stringUtils";

/** Type filter tabs (Все / Продажа / Поставка / Продажа и поставка). "both" matches
 * only products that are both sellable and supplyable (type "All"); "sale" and
 * "supply" inclusively match "All" too. */
export type ProductTypeFilter = "all" | "sale" | "supply" | "both";

export function matchesType(type: Product["type"], filter: ProductTypeFilter): boolean {
	switch (filter) {
		case "sale":
			return type === "Sale" || type === "All";
		case "supply":
			return type === "Supply" || type === "All";
		case "both":
			return type === "All";
		default:
			return true;
	}
}

/**
 * Stock alert of a product: `out` — none left, `low` — at or below its
 * «Минимальный остаток», `ok` — enough. The threshold is product-level for v1
 * (DR-23 amended 2026-10-04); 0 or none alerts only when stock runs out.
 */
export type StockLevel = "out" | "low" | "ok";

export function stockLevel(quantity: number, threshold: number | null | undefined): StockLevel {
	if (quantity <= 0) {
		return "out";
	}
	return quantity <= (threshold ?? 0) ? "low" : "ok";
}

/**
 * A product's level across all warehouses — from the served `isLowStock` (total ≤
 * threshold). An archived product is out of trade: no alert, and the «Остаток»
 * filter never lists it.
 */
export function productStockLevel(product: Product): StockLevel {
	if (product.isArchived) {
		return "ok";
	}
	if (product.totalStock <= 0) {
		return "out";
	}
	return product.isLowStock ? "low" : "ok";
}

/** «Остаток» filter: every row, the ones running low (incl. none left), or none left only. */
export type StockFilter = "all" | "low" | "out";

export function matchesStockFilter(level: StockLevel, filter: StockFilter): boolean {
	switch (filter) {
		case "low":
			return level !== "ok";
		case "out":
			return level === "out";
		default:
			return true;
	}
}

/** List and POS search: name, SKU, the product barcode or its packaging barcode. */
export function matchesProductSearch(product: Product, term: string): boolean {
	return (
		matchesSearch(product.name, term) ||
		matchesSearch(product.sku, term) ||
		matchesSearch(product.barcode, term) ||
		matchesSearch(product.packaging?.barcode, term)
	);
}

/** A scanned code that names exactly one product; `asPackage` when it is the packaging barcode. */
export interface BarcodeMatch {
	product: Product;
	asPackage: boolean;
}

/**
 * The single product whose barcode or packaging barcode equals the typed code
 * exactly — what a USB scanner types before Enter. Two products sharing a code
 * match nothing, so the cashier picks from the list instead.
 */
export function findBarcodeMatch(products: Product[], code: string): BarcodeMatch | null {
	const value = code.trim();
	if (!value) {
		return null;
	}
	const matches: BarcodeMatch[] = [];
	for (const product of products) {
		const scanned = scannedAs(product, value);
		if (scanned) {
			matches.push({ product, asPackage: scanned === "package" });
		}
	}
	return matches.length === 1 ? matches[0] : null;
}

/**
 * The first product already carrying the code as its barcode or packaging
 * barcode. The POS checks the whole catalogue (archived and other-type products
 * too) before offering «Создать товар», since a second product with the same
 * code would stop the scanner adding either.
 */
export function findBarcodeOwner(products: Product[], code: string): Product | null {
	const value = code.trim();
	return value ? (products.find((product) => scannedAs(product, value) !== null) ?? null) : null;
}

function scannedAs(product: Product, code: string): "unit" | "package" | null {
	if (product.barcode?.trim() === code) {
		return "unit";
	}
	return product.packaging?.barcode?.trim() === code ? "package" : null;
}
