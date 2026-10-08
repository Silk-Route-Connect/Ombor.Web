import { useCallback, useMemo, useState } from "react";
import { StockFilter } from "utils/stockLevel";

/** «Все» in the category filter. */
export const ALL_CATEGORIES = "__all__";

export interface WarehouseStockFilters {
	query: string;
	setQuery: (value: string) => void;
	category: string;
	setCategory: (value: string) => void;
	stockFilter: StockFilter;
	setStockFilter: (value: StockFilter) => void;
	/** Search, category or «Остаток» narrows the rows. */
	isFiltering: boolean;
	/** Exactly the rows the «Заканчивается» KPI counts: every other filter off. */
	showLowStock: () => void;
	reset: () => void;
}

/**
 * The «Остатки» tab's filters, held by the detail page so the «Заканчивается»
 * KPI can open the tab on exactly the rows it counts.
 */
export function useWarehouseStockFilters(): WarehouseStockFilters {
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState(ALL_CATEGORIES);
	const [stockFilter, setStockFilter] = useState<StockFilter>("all");

	// Stable, so a page effect (reset on another warehouse) never re-runs on a keystroke.
	const showOnly = useCallback((filter: StockFilter) => {
		setQuery("");
		setCategory(ALL_CATEGORIES);
		setStockFilter(filter);
	}, []);
	const showLowStock = useCallback(() => showOnly("low"), [showOnly]);
	const reset = useCallback(() => showOnly("all"), [showOnly]);

	return useMemo(
		() => ({
			query,
			setQuery,
			category,
			setCategory,
			stockFilter,
			setStockFilter,
			isFiltering: query.trim() !== "" || category !== ALL_CATEGORIES || stockFilter !== "all",
			showLowStock,
			reset,
		}),
		[query, category, stockFilter, showLowStock, reset],
	);
}
