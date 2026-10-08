import { useState } from "react";
import { useLocation } from "react-router-dom";

import { DEFAULT_ROWS_PER_PAGE, ROWS_PER_PAGE_OPTIONS } from "./DataTable/tableConfigs";

const STORAGE_PREFIX = "ombor.rowsPerPage:";

/**
 * Which table a remembered page size belongs to: the table kind, the route up
 * to its first record id, and the page's own name for the table when it has
 * several. «/adjustments/5» (a detail modal over the list) keeps the list's key,
 * and every wallet's «Операции» tab shares one.
 */
function storageKeyOf(scope: "list" | "detail", pathname: string, tableKey?: string): string {
	const segments = pathname.split("/");
	const firstId = segments.findIndex((segment) => /^\d+$/.test(segment));
	const route = (firstId === -1 ? segments : segments.slice(0, firstId)).join("/");
	return `${STORAGE_PREFIX}${scope}:${route}${tableKey ? `#${tableKey}` : ""}`;
}

function readStored(key: string, options: readonly number[]): number | null {
	try {
		const value = Number(localStorage.getItem(key));
		return options.includes(value) ? value : null;
	} catch {
		return null;
	}
}

function writeStored(key: string, value: number): void {
	try {
		localStorage.setItem(key, String(value));
	} catch {
		/* storage unavailable — the choice still holds until the page is left */
	}
}

interface RowsPerPageConfig {
	/** The table's page sizes; the canonical 25 / 50 / 100 unless it overrides them. */
	options?: readonly number[];
	/** The size a first visit opens on; 25 (or the smallest option) when left out. */
	initial?: number;
	/** Names the table among several on one page (see `storageKeyOf`). */
	tableKey?: string;
}

function startingSize(options: readonly number[], initial?: number): number {
	if (initial !== undefined && options.includes(initial)) return initial;
	if (options.includes(DEFAULT_ROWS_PER_PAGE)) return DEFAULT_ROWS_PER_PAGE;
	return options[0] ?? DEFAULT_ROWS_PER_PAGE;
}

/**
 * A table's page size, remembered per viewer in this browser: the 25 / 50 / 100
 * last picked for this table comes back on the next visit. A remembered size
 * that is no longer offered (the 10 of the old 10 / 25 / 50 set) is ignored, so
 * the table opens on 25 again. A per-viewer convenience only — without storage
 * the table opens on its starting size.
 */
export function useRowsPerPage(
	scope: "list" | "detail",
	{ options = ROWS_PER_PAGE_OPTIONS, initial, tableKey }: RowsPerPageConfig = {},
): [number, (next: number) => void] {
	const { pathname } = useLocation();
	const key = storageKeyOf(scope, pathname, tableKey);
	const restore = () => readStored(key, options) ?? startingSize(options, initial);
	const [state, setState] = useState(() => ({ key, value: restore() }));

	// The same table instance can move to another route (Продажи → Поставки).
	if (state.key !== key) {
		setState({ key, value: restore() });
	}

	const update = (next: number) => {
		setState({ key, value: next });
		writeStored(key, next);
	};

	return [state.value, update];
}
