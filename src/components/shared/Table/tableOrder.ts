import { useState } from "react";

type Sorter<T> = (rows: readonly T[]) => T[];

/**
 * Lets a page export rows in the order its table shows them (CSV follows the
 * on-screen sort): the table attaches its current sort, the export calls
 * `apply`. With no table attached `apply` keeps the given order.
 */
export class TableOrder<T> {
	private sorter: Sorter<T> | null = null;

	attach(sorter: Sorter<T>): void {
		this.sorter = sorter;
	}

	detach(sorter: Sorter<T>): void {
		if (this.sorter === sorter) {
			this.sorter = null;
		}
	}

	apply(rows: readonly T[]): T[] {
		return this.sorter ? this.sorter(rows) : [...rows];
	}
}

/** One stable `TableOrder` for a page or tab — pass it to its table as `exportOrder`. */
export function useTableOrder<T>(): TableOrder<T> {
	const [order] = useState(() => new TableOrder<T>());
	return order;
}
