import { useState } from "react";
import { useLocation } from "react-router-dom";

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

/**
 * A table's page size, remembered per viewer in this browser: the 10 / 25 / 50
 * last picked for this table comes back on the next visit. A per-viewer
 * convenience only — without storage the table opens on `initial` as before.
 */
export function useRowsPerPage(
	scope: "list" | "detail",
	initial: number,
	options: readonly number[],
	tableKey?: string,
): [number, (next: number) => void] {
	const { pathname } = useLocation();
	const key = storageKeyOf(scope, pathname, tableKey);
	const [state, setState] = useState(() => ({ key, value: readStored(key, options) ?? initial }));

	// The same table instance can move to another route (Продажи → Поставки).
	if (state.key !== key) {
		setState({ key, value: readStored(key, options) ?? initial });
	}

	const update = (next: number) => {
		setState({ key, value: next });
		writeStored(key, next);
	};

	return [state.value, update];
}
