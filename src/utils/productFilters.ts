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
 * Products «Остаток: Все / Нет в наличии» — a fact read from the served total
 * over every warehouse. Low stock is not a product matter (DR-41): thresholds
 * live on the warehouse rows, so Products has no «Заканчивается».
 */
export type ProductStockFilter = "all" | "out";

export const PRODUCT_STOCK_FILTERS: readonly ProductStockFilter[] = ["all", "out"];

/** None left in any warehouse; an archived product is out of trade and never listed by it. */
export function isOutOfStock(product: Product): boolean {
	return !product.isArchived && product.totalStock <= 0;
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
