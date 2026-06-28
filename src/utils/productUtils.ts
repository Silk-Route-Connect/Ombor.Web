import { TFunction } from "i18next";
import { Measurement, Product, ProductPackaging, ProductTransaction } from "models/product";
import { ProductFormInputs } from "schemas/ProductSchema";

/** Short unit codes for the «Ед. изм.» column, keyed by the domain enum. */
export const MEASUREMENT_SHORT: Record<Measurement, string> = {
	Gram: "г",
	Kilogram: "кг",
	Ton: "т",
	Piece: "шт",
	Box: "кор",
	Unit: "ед",
	None: "—",
};

/**
 * Inline unit for a quantity value (e.g. «5 Килограмм») — the FULL localized
 * term, or empty for `None` so a unit-less quantity reads «5» (never a bare
 * trailing dash). For a dedicated unit column/field use {@link measurementLabel}.
 * (`MEASUREMENT_SHORT` is kept for other modules that still render short codes.)
 */
export function unitInline(t: TFunction, measurement: Measurement): string {
	return measurement === "None" ? "" : t(`product.measurement.${measurement}`);
}

/**
 * Localized unit label for a dedicated unit column/field — the full term, or a
 * bare «—» when unset (`None`). Never «Без единицы (—)» / «кор»; "—" means "not
 * set" (matching the packaging field's convention).
 */
export function measurementLabel(t: TFunction, measurement: Measurement): string {
	return measurement === "None" ? "—" : t(`product.measurement.${measurement}`);
}

export function isAvialableForSale(product: Product) {
	return product.salePrice >= 0;
}

/**
 * Total value of stock on hand: Σ(quantity × per-warehouse WAC) over the served
 * inventory items. Display arithmetic over server-provided fields — both
 * operands are served (hard rule 8); the backend may serve this directly later.
 */
export function stockValue(product: Product): number {
	return product.warehouseItems.reduce((sum, item) => sum + item.quantity * item.averageCost, 0);
}

export function calculateLineTotals(unitPrice: number, quantity: number, discount: number) {
	const lineTotal = unitPrice * quantity;
	const discountAmount = (lineTotal * discount) / 100;
	const totalWithDiscount = lineTotal - discountAmount;

	return { lineTotal, discountAmount, totalWithDiscount };
}

export function calculateProductTransactionTotal(transaction: ProductTransaction) {
	return calculateLineTotals(transaction.unitPrice, transaction.quantity, transaction.discount)
		.totalWithDiscount;
}

export function getPrice(product: Product, type: "Sale" | "Supply") {
	return type === "Sale" ? product.salePrice : product.supplyPrice;
}

export const mapProductToFormPayload = (product: Product): ProductFormInputs => {
	return {
		name: product.name,
		categoryId: product.categoryId,
		measurement: product.measurement,
		type: product.type,
		sku: product.sku,
		description: product.description ?? "",
		barcode: product.barcode ?? "",

		supplyPrice: Number(product.supplyPrice),
		salePrice: Number(product.salePrice),

		lowStockThreshold: product.lowStockThreshold ?? null,

		packaging: product.packaging
			? {
					size: product.packaging.size,
					label: product.packaging.label ?? undefined,
					barcode: product.packaging.barcode ?? undefined,
				}
			: undefined,
		attachments: undefined,
	};
};

export const mapFormPackagingToPackaging = (
	packaging: ProductFormInputs["packaging"],
): ProductPackaging | undefined => {
	if (!packaging) {
		return undefined;
	}

	return {
		size: packaging.size,
		label: packaging.label ?? null,
		barcode: packaging.barcode ?? null,
	};
};

const IMAGE_BASE_URL = import.meta.env.VITE_OMBOR_API_BASE_URL ?? "";

export function getImageFullUrl(path?: string): string | undefined {
	if (!path) {
		return undefined;
	}

	// Self-contained URLs (mock object URLs, inline data URIs) need no base.
	if (/^(data|blob|https?):/.test(path)) {
		return path;
	}

	const base = IMAGE_BASE_URL.replace(/\/+$|\\+$/, "");
	const p = path.replace(/^\/+/, "");

	return `${base}/${p}`;
}
