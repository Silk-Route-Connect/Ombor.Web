import { Product } from "models/product";

export function isAvialableForSale(product: Product) {
	return product.quantityInStock >= 0;
}

export function calculateLineTotals(unitPrice: number, quantity: number, discount: number) {
	const lineTotal = unitPrice * quantity;
	const discountAmount = (lineTotal * discount) / 100;

	return { lineTotal, discountAmount };
}

export function getPrice(product: Product, type: "Sale" | "Supply") {
	return type === "Sale" ? product.salePrice : product.supplyPrice;
}
