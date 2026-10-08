import { designTokens, iconSize } from "theme";

import { SxProps, Theme } from "@mui/material";

/**
 * The one table chrome — list (`DataTable`, `ExpandableDataTable`) and detail
 * (`DetailTable`) tables render the same header band, rows and total band from
 * these values, so a table looks and behaves the same wherever it sits.
 *
 * Token mapping (DSN-1 → theme):
 * - header / footer / total band background  --bg-subtle → designTokens.gray25
 * - band separators                          --border    → palette.divider
 * - in-body row dividers (lighter)           --divider   → designTokens.gray100
 * - row hover (clickable rows only)          teal wash   → palette.action.hover
 * - row keyboard focus (clickable rows)      2px inset ring → palette.primary.main
 */

/** Header band height — fixed, so a column with an «i» never makes its band taller. */
export const HEADER_HEIGHT = 42;

/** Minimum body row height (DSN-1 kit density); a two-line name still fits. */
export const ROW_HEIGHT = 52;

export const HEADER_CONTAINER_SX: SxProps<Theme> = {
	position: "sticky",
	top: 0,
	zIndex: 2,
};

export const HEAD_CELL_SX: SxProps<Theme> = {
	height: HEADER_HEIGHT,
	bgcolor: designTokens.gray25,
	color: "text.secondary",
	fontSize: 12,
	fontWeight: 600,
	lineHeight: "16px",
	py: "12px",
	px: 2,
	borderBottom: 1,
	borderColor: "divider",
	whiteSpace: "nowrap",
	// The arrow trails the label on every column — MUI flips it to the left on
	// right-aligned cells, which put it on different sides per column.
	"& .MuiTableSortLabel-root": { color: "text.secondary", flexDirection: "row" },
	"& .MuiTableSortLabel-root:hover": { color: "primary.dark" },
	"& .MuiTableSortLabel-root.Mui-active": { color: "primary.dark" },
	"& .MuiTableSortLabel-icon": { fontSize: iconSize.sm },
	// MUI greys the active arrow; it follows the label colour instead.
	"& .MuiTableSortLabel-root.Mui-active .MuiTableSortLabel-icon": { color: "inherit" },
	// An inactive column's hidden arrow takes no space, so right-aligned headers
	// line up with their values; it reappears on hover as a preview.
	"& .MuiTableSortLabel-root:not(.Mui-active):not(:hover) .MuiTableSortLabel-icon": {
		width: 0,
		mx: 0,
	},
};

export const BODY_CELL_SX: SxProps<Theme> = {
	height: ROW_HEIGHT,
	py: "4px",
	px: 2,
	fontSize: 14,
	lineHeight: "20px",
	color: "text.primary",
	verticalAlign: "middle",
	borderBottom: 1,
	borderColor: designTokens.gray100,
};

/** The pinned «Итого» / «Начальный остаток» band at the end of a table body. */
export const TOTAL_CELL_SX: SxProps<Theme> = {
	bgcolor: designTokens.gray25,
	fontWeight: 700,
	borderTop: "1.5px solid",
	borderTopColor: designTokens.gray300,
	borderBottom: 0,
};

/**
 * Body row chrome: hairline rows, the last one borderless (the footer band or
 * card edge closes the table). Only a row that opens something gets the hover
 * wash and the pointer — a static row (Reports, Categories) never looks clickable.
 * A keyboard-focused row draws its own inset ring: MUI's `TableRow` resets
 * `outline`, which beats the app-wide zero-specificity `:focus-visible` ring.
 */
export const rowChromeSx = (clickable: boolean): SxProps<Theme> => ({
	"&:last-of-type td": { borderBottom: 0 },
	...(clickable && {
		cursor: "pointer",
		"&:hover": { bgcolor: "action.hover" },
		"&:focus-visible": {
			outline: (theme: Theme) => `2px solid ${theme.palette.primary.main}`,
			outlineOffset: "-2px",
			bgcolor: "action.hover",
		},
	}),
});

/** Footer band — brackets the body opposite the header band (pager, totals). */
export const FOOTER_SX: SxProps<Theme> = {
	bgcolor: designTokens.gray25,
	borderTop: 1,
	borderColor: "divider",
};
