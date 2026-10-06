import { useCallback, useEffect, useState } from "react";

import type { Column, DefaultSort, SortOrder } from "./DataTable/DataTable";
import { compareValues } from "./DataTable/tableConfigs";
import { TableOrder } from "./tableOrder";

export interface TableSort<T> {
	sortKey: string | null;
	order: SortOrder;
	/** The active column flips asc ↔ desc; another column starts ascending. */
	requestSort: (key: string) => void;
	/** Rows in the current order — what the table shows and what its CSV export writes. */
	sortRows: (rows: readonly T[]) => T[];
}

/** Sortable unless it opts out, is the actions column, or has no sort source. */
export const isSortableColumn = <T>(col: Column<T>): boolean =>
	col.key !== "actions" && col.sortable !== false && (col.sortValue != null || col.field != null);

/**
 * Client-side sort state shared by `DataTable`, `ExpandableDataTable` and
 * `DetailTable`. Given `exportOrder`, the page's CSV export sorts its rows the
 * same way the table shows them.
 */
export function useTableSort<T>(
	columns: Column<T>[],
	defaultSort?: DefaultSort,
	exportOrder?: TableOrder<T>,
): TableSort<T> {
	const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key ?? null);
	const [order, setOrder] = useState<SortOrder>(defaultSort?.order ?? "asc");

	const sortRows = useCallback(
		(rows: readonly T[]): T[] => {
			const col = sortKey ? columns.find((c) => c.key === sortKey) : undefined;
			const accessor = col?.sortValue ?? (col?.field != null ? (r: T) => r[col.field!] : null);
			if (!accessor) {
				return [...rows];
			}
			// Descending is the stable ascending order reversed — configs rely on it
			// (a refund's +0.5 ms date key keeps it right above its original).
			const asc = [...rows].sort((a, b) => compareValues(accessor(a), accessor(b)));
			return order === "desc" ? asc.reverse() : asc;
		},
		[columns, sortKey, order],
	);

	useEffect(() => {
		if (!exportOrder) {
			return;
		}
		exportOrder.attach(sortRows);
		return () => exportOrder.detach(sortRows);
	}, [exportOrder, sortRows]);

	const requestSort = (key: string) => {
		setOrder(sortKey === key && order === "asc" ? "desc" : "asc");
		setSortKey(key);
	};

	return { sortKey, order, requestSort, sortRows };
}
