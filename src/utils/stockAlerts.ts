import { Product } from "models/product";

import { productStockLevel } from "./productFilters";

export interface StockAlert {
	product: Product;
	level: "low" | "out";
}

/** How urgent an alert is: none left first, then the smallest share of the minimum left. */
const urgency = ({ product, level }: StockAlert): number =>
	level === "out" ? -1 : product.totalStock / Math.max(product.lowStockThreshold ?? 0, 1);

/**
 * The products the dashboard «Заканчивается» panel lists — the same set as
 * Products «Остаток: Заканчивается» (served `isLowStock` on the total across
 * warehouses, archived products never alert), the emptiest first.
 */
export function stockAlerts(products: readonly Product[]): StockAlert[] {
	return products
		.map((product) => ({ product, level: productStockLevel(product) }))
		.filter((alert): alert is StockAlert => alert.level !== "ok")
		.sort(
			(a, b) =>
				urgency(a) - urgency(b) ||
				a.product.name.localeCompare(b.product.name, "ru", { sensitivity: "base" }),
		);
}
