/**
 * The low-stock reading of one warehouse row (DR-41): the threshold belongs to
 * the product in that warehouse, and the server flags the row (`isLowStock` =
 * tracked and quantity ≤ threshold, never on an archived product or warehouse).
 * Every «Заканчивается» count is the number of rows it flags, so a filter on the
 * flag lists exactly what the count says.
 */
export interface ServedStockRow {
	quantity: number;
	isLowStock: boolean;
}

/** What a row's pill says: `out` — none left, `low` — the served flag, `ok` — nothing. */
export type StockLevel = "out" | "low" | "ok";

/**
 * «Нет в наличии» is a fact read from the quantity, shown whether the row is
 * tracked or not; «Мало» is the served flag. A tracked row at zero is both —
 * the red pill wins, and it still counts toward «Заканчивается».
 */
export function stockRowLevel(row: ServedStockRow): StockLevel {
	if (row.quantity <= 0) {
		return "out";
	}
	return row.isLowStock ? "low" : "ok";
}

/** «Остаток: Все / Заканчивается / Нет в наличии». */
export type StockFilter = "all" | "low" | "out";

export const STOCK_FILTERS: readonly StockFilter[] = ["all", "low", "out"];

/**
 * «Заканчивается» is the served flag (zero included, untracked rows never);
 * «Нет в наличии» is every row at zero, tracked or not.
 */
export function matchesStockFilter(row: ServedStockRow, filter: StockFilter): boolean {
	switch (filter) {
		case "low":
			return row.isLowStock;
		case "out":
			return row.quantity <= 0;
		default:
			return true;
	}
}

/** A flagged row with what the «Заканчивается» lists show of it. */
export interface LowStockRow extends ServedStockRow {
	productName: string;
	lowStockThreshold?: number | null;
}

/** None left first, then the smallest share of the threshold left. */
const emptiness = (row: LowStockRow): number => {
	const threshold = row.lowStockThreshold ?? 0;
	return row.quantity <= 0 || threshold <= 0 ? -1 : row.quantity / threshold;
};

/**
 * The served «Заканчивается» rows (`isLowStock`) — exactly what the counts
 * count — the emptiest first, then by product name.
 */
export function lowStockRows<T extends LowStockRow>(rows: readonly T[]): T[] {
	return rows
		.filter((row) => row.isLowStock)
		.sort(
			(a, b) =>
				emptiness(a) - emptiness(b) ||
				a.productName.localeCompare(b.productName, "ru", { sensitivity: "base" }),
		);
}
