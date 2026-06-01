import { Warehouse } from "models/warehouse";

export interface WarehouseStats {
	/** Number of distinct products held in the warehouse. */
	products: number;
	/** Total quantity of all items. */
	units: number;
	/**
	 * Total stock value at weighted-average cost. Not computable yet —
	 * weighted-average cost is a known backend gap — so this is null.
	 */
	value: number | null;
}

export function getWarehouseStats(warehouse: Warehouse): WarehouseStats {
	const items = warehouse.items ?? [];
	return {
		products: items.length,
		units: items.reduce((sum, item) => sum + item.quantity, 0),
		value: null,
	};
}

export interface WarehousesSummary {
	activeCount: number;
	/** Distinct products across all active warehouses. */
	totalProducts: number;
	/** Aggregate stock value — null until weighted-average cost exists. */
	totalValue: number | null;
}

export function getWarehousesSummary(warehouses: Warehouse[]): WarehousesSummary {
	const active = warehouses.filter((w) => w.isActive);
	const productIds = new Set<number>();
	active.forEach((w) => (w.items ?? []).forEach((item) => productIds.add(item.productId)));

	return {
		activeCount: active.length,
		totalProducts: productIds.size,
		totalValue: null,
	};
}
