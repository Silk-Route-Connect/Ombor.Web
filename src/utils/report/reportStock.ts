import { StockReportRow } from "models/report";
import { StockLevel } from "utils/productFilters";

/**
 * A stock-report row's alert, from the served per-warehouse flag (the warehouse
 * «Остатки» rule). An archived product is out of trade and never alerts, as on
 * Products.
 */
export function stockRowLevel(row: StockReportRow): StockLevel {
	if (row.productIsArchived) {
		return "ok";
	}
	if (row.quantity <= 0) {
		return "out";
	}
	return row.isLowStock ? "low" : "ok";
}

/**
 * Each product's alert in one warehouse, from the served report rows of that
 * warehouse (`?warehouseId=`): a row's `isLowStock` is exactly what the served
 * `lowStockCount` counts, so the «Остатки» filter «Заканчивается» lists those
 * rows and no others. Unlike {@link stockRowLevel}, an archived product still
 * alerts here — the served count includes it. A row the report leaves out
 * (none on hand of an archived product or warehouse) is not counted: no alert.
 */
export function warehouseStockLevels(rows: readonly StockReportRow[]): Map<number, StockLevel> {
	return new Map(
		rows.map((row) => [row.productId, !row.isLowStock ? "ok" : row.quantity <= 0 ? "out" : "low"]),
	);
}
