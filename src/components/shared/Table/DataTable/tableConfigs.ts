import { designTokens, radius } from "theme";

import { SxProps, Theme } from "@mui/material";

/**
 * Shared data-table look & behaviour — the canonical DSN-1 table spec mapped to
 * theme tokens (the design-system "table" component on the foundational sheet
 * plus the reusable web kit). Every list table built on the shared `DataTable` /
 * `ExpandableDataTable` inherits from here; edit these to restyle every table.
 *
 * Token mapping (DSN-1 → theme):
 * - header / footer band background  --bg-subtle → designTokens.gray25
 * - zebra (even rows)                --bg-subtle → designTokens.gray25
 * - band separators (header/footer)  --border    → palette.divider (gray-200)
 * - in-body row dividers (lighter)   --divider   → designTokens.gray100
 * - container radius                 --radius-xl → radius.xl (16px)
 * - container elevation              --shadow-sm → Paper elevation={1} (--e-1)
 * - row hover                        teal wash   → palette.action.hover
 * - open / selected row              --primary-soft → palette.action.selected
 *
 * Density is the kit spec: 52px rows, 16px horizontal cell padding, 12px header
 * padding (the foundational card shows 46/14/11px — off the 8px scale; the kit's
 * tokenised values are used instead).
 */

export const DEFAULT_ROWS_PER_PAGE = 10;

/**
 * Canonical page-size choices for every table. Override per table only with a
 * documented reason (e.g. very high-volume feeds).
 */
export const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

/** Canonical row height (DSN-1 kit) — drives every list table's density. */
export const ROW_HEIGHT = 52;

/** Width of the trailing ⋮ actions column (fits a single icon button). */
export const ACTIONS_COLUMN_WIDTH = 56;

/**
 * Column widths per column type (padding included) for fixed-layout tables
 * (`DataTable` `fixedLayout`): these columns keep their width and the columns
 * without one (entity names) share the rest, so a search that narrows the rows
 * never re-flows the columns (live-ui-23).
 */
export const COLUMN_WIDTH = {
	number: 120,
	dateTime: 160,
	chip: 152,
	direction: 136,
	money: 152,
	quantity: 124,
	count: 108,
	author: 168,
} as const;

/** Fixed layout; below `minWidth` the table scrolls inside its card instead of crushing. */
export const FIXED_TABLE_SX: SxProps<Theme> = {
	tableLayout: "fixed",
	minWidth: 880,
};

export const TABLE_CONTAINER_SX: SxProps<Theme> = {
	border: 1,
	borderColor: "divider", // DSN --border
	borderRadius: `${radius.xl}px`, // DSN --radius-xl (16px)
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

export const HEADER_CONTAINER_SX: SxProps<Theme> = {
	position: "sticky",
	top: 0,
	zIndex: 2,
};

export const HEADER_CELL_SX: SxProps<Theme> = {
	bgcolor: designTokens.gray25, // DSN --bg-subtle header band
	color: "text.secondary", // DSN --fg-2
	fontSize: 12, // DSN --text-caption
	fontWeight: 600,
	lineHeight: 1.4,
	py: "12px", // DSN kit header padding (12px vertical)
	px: 2, // 16px (sp-4)
	borderBottom: 1,
	borderColor: "divider", // DSN --border (stronger band separator)
	whiteSpace: "nowrap",
	// Sort affordance: icon trails the label on ONE side (right) for every column —
	// MUI flips to row-reverse for align="right" cells (icon on the left), so force
	// row back. Teal-600 (--primary-dark) on active.
	"& .MuiTableSortLabel-root": { color: "text.secondary", flexDirection: "row" },
	"& .MuiTableSortLabel-root:hover": { color: "primary.dark" },
	"& .MuiTableSortLabel-root.Mui-active": { color: "primary.dark" },
	"& .MuiTableSortLabel-icon": { fontSize: 16, color: "inherit !important" },
	// The hidden arrow of an inactive column takes no space, so right-aligned
	// headers line up with their values; it reappears on hover.
	"& .MuiTableSortLabel-root:not(.Mui-active):not(:hover) .MuiTableSortLabel-icon": {
		width: 0,
		mx: 0,
	},
};

export const BODY_CELL_SX: SxProps<Theme> = {
	height: ROW_HEIGHT, // 52px, content vertically centred (DSN)
	py: 0,
	px: 2, // 16px
	fontSize: 14, // body
	borderBottom: 1,
	borderColor: designTokens.gray100, // DSN --divider (lighter in-body rows)
};

/**
 * Row chrome: zebra on even rows, teal hover, and a borderless last row — the
 * DSN-1 table body. `ExpandableDataTable` applies zebra by data index instead of
 * `nth-of-type`, since its collapse rows interleave with the data rows.
 */
export const ROW_SX: SxProps<Theme> = {
	"&:nth-of-type(even)": { bgcolor: designTokens.gray25 }, // DSN zebra
	"&:hover": { bgcolor: "action.hover" }, // teal wash
	"&:last-of-type td": { borderBottom: 0 }, // DSN last row carries no divider
};

/** Footer band — brackets the body opposite the header band. */
export const FOOTER_SX: SxProps<Theme> = {
	bgcolor: designTokens.gray25, // DSN --bg-subtle footer band
	borderTop: 1,
	borderColor: "divider", // DSN --border
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
