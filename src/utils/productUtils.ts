import { TFunction } from "i18next";
import {
	CreateProductRequest,
	Measurement,
	Product,
	ProductPackaging,
	ProductTransaction,
} from "models/product";
import { ProductFormInputs, ProductFormValues } from "schemas/ProductSchema";

/**
 * Short localized unit code next to a number («5 кг», «На складе: 24 шт»), or
 * empty when unset (`None`) so a unit-less quantity reads «5», never «5 —».
 * `Unit` is a legacy alias of Piece the backend may still serve
 * (issues-tracker §12) — it keeps its own short code.
 */
export function measurementShort(t: TFunction, measurement: Measurement): string {
	return measurement === "None" ? "" : t(`product.measurementShort.${measurement}`);
}

/**
 * Unit word inside a field label («Кол-во · кг», «Цена за шт»): the short code,
 * or the generic «ед.» when unset — a label never ends in a bare «за» or «·».
 */
export function measurementShortLabel(t: TFunction, measurement: Measurement): string {
	return measurementShort(t, measurement) || t("product.measurementShort.generic");
}

/**
 * Inline unit for a quantity value (e.g. «5 Килограмм») — the FULL localized
 * term, or empty for `None` so a unit-less quantity reads «5» (never a bare
 * trailing dash). For a dedicated unit column/field use {@link measurementLabel}.
 * For a short code next to a number use {@link measurementShort}.
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
	return (product.warehouseItems ?? []).reduce(
		(sum, item) => sum + item.quantity * item.averageCost,
		0,
	);
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
		// `Unit` is a deprecated alias of `Piece` (removed from the picker); a product
		// served with legacy `Unit` prefills as `Piece` so the select isn't blank and it
		// migrates to `Piece` on save (issues-tracker §12).
		measurement: product.measurement === "Unit" ? "Piece" : product.measurement,
		type: product.type,
		sku: product.sku,
		description: product.description ?? "",
		barcode: product.barcode ?? "",

		supplyPrice: Number(product.supplyPrice),
		salePrice: Number(product.salePrice),

		// 0 is the served default and means the same as no threshold — show it empty.
		lowStockThreshold: product.lowStockThreshold || null,

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

/** The validated product form → the create / update request body. */
export const toProductRequest = (payload: ProductFormValues): CreateProductRequest => ({
	categoryId: payload.categoryId,
	name: payload.name,
	sku: payload.sku,
	description: payload.description,
	barcode: payload.barcode,
	salePrice: payload.salePrice,
	supplyPrice: payload.supplyPrice,
	measurement: payload.measurement,
	type: payload.type,
	lowStockThreshold: payload.lowStockThreshold ?? null,
	packaging: mapFormPackagingToPackaging(payload.packaging),
	attachments: payload.attachments,
});

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
