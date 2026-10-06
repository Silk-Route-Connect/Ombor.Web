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
