import { radius } from "theme";

import { SxProps, Theme } from "@mui/material";

/**
 * List-table configuration: page sizes, column widths, the card container and
 * its scroll. The header / row / total chrome every table shares (list and
 * detail alike) lives in `../tableChrome`.
 */

/**
 * Canonical page-size choices for every table (owner decision 2026-10-07: 25 /
 * 50 / 100, opening on 25). Override per table only with a documented reason
 * (e.g. very high-volume feeds).
 */
export const ROWS_PER_PAGE_OPTIONS: readonly number[] = [25, 50, 100];

export const DEFAULT_ROWS_PER_PAGE = 25;

/** Width of the trailing ⋮ actions column (fits a single icon button). */
export const ACTIONS_COLUMN_WIDTH = 56;

/**
 * Column widths per column type (padding included) for fixed-layout tables
 * (`DataTable` `fixedLayout`): these columns keep their width and the columns
 * without one (entity names) share the rest, so a search that narrows the rows
 * never re-flows the columns (live-ui-23). The steps are as narrow as their
 * content allows (the № copy button overlays the padding), so Stock adjustments
 * — the widest event list — fits a 1366px screen without sideways scrolling.
 */
export const COLUMN_WIDTH = {
	number: 104,
	dateTime: 140, // «05.10.2026 17:24» in proportional figures + padding
	chip: 152,
	direction: 136,
	money: 152,
	quantity: 112,
	count: 100,
	author: 168,
} as const;

/** The narrowest an entity-name column (no `COLUMN_WIDTH`) gets before the table scrolls. */
export const NAME_COLUMN_MIN_WIDTH = 120;

/**
 * Fixed layout sized to its columns: the fixed widths plus a readable share for
 * each name column. Below that the table scrolls inside its card instead of
 * crushing the names to a few letters (a 9-column list at 1280px).
 */
export function fixedTableSx(widths: ReadonlyArray<number | string | undefined>): SxProps<Theme> {
	const minWidth = widths.reduce<number>(
		(sum, width) => sum + (typeof width === "number" ? width : NAME_COLUMN_MIN_WIDTH),
		0,
	);
	return { tableLayout: "fixed", minWidth };
}

export const TABLE_CONTAINER_SX: SxProps<Theme> = {
	border: 1,
	borderColor: "divider", // DSN --border
	borderRadius: `${radius.lg}px`, // the card radius — list and detail tables alike
	overflow: "hidden",
};

/**
 * The table body scrolls inside the card, capped at the visible content height
 * (viewport − 60px topbar − 48px page padding − 56px pager). Any scroll container
 * between the header and the page's <main> breaks `position: sticky`, so the
 * table must own its scroll for the header band to stay visible on long lists.
 */
export const TABLE_SCROLL_SX: SxProps<Theme> = {
	overflow: "auto",
	maxHeight: "calc(100vh - 164px)",
};

/** Locale-aware comparator for client-side column sorting (ascending). */
export function compareValues(a: unknown, b: unknown): number {
	if (a == null && b == null) return 0;
	if (a == null) return -1;
	if (b == null) return 1;
	if (typeof a === "number" && typeof b === "number") return a - b;
	if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
	return String(a).localeCompare(String(b), "ru");
}
