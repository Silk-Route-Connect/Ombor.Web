import { Product, ProductPackaging, ProductTransaction } from "models/product";
import { ProductFormInputs } from "schemas/ProductSchema";

export function isAvialableForSale(product: Product) {
	return product.salePrice >= 0;
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
		retailPrice: Number(product.retailPrice),

		packaging: product.packaging
			? {
					size: product.packaging.size,
					label: product.packaging.label ?? undefined,
					barcode: product.packaging.barcode ?? undefined,
				}
			: undefined,
		attachments: undefined,
		notes: product.notes,
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

	const base = IMAGE_BASE_URL.replace(/\/+$|\\+$/, "");
	const p = path.replace(/^\/+/, "");

	return `${base}/${p}`;
}
