import { designTokens } from "theme";

/**
 * The single source of truth for the **embedded detail-table chrome** (FE-INFRA-5,
 * DSN-1 warm bands) — the hand-rolled `Box component="table"` tables that detail
 * pages use instead of the list `DataTable` because they carry «Итого» /
 * «Начальный остаток» summary rows the generic table can't express.
 *
 * Two consumption shapes, one definition:
 *  - **table-level** (`<table sx={detailTableSx}>` + `.r` / `.total` classes) — Product,
 *    Warehouse and Transfer detail tables;
 *  - **per-cell** (`<th sx={detailHeadCellSx}>` / `<td sx={detailBodyCellSx}>`) — the
 *    Partner ledger / transactions / payments tables.
 *
 * Footer is configuration, not a second component: render a `.total` row for the
 * total-band form (Product), or omit it and let the card shell supply a
 * `TablePagination` footer (Partner). The header / cell chrome is identical either way.
 */

/** Warm header cell: muted 12px label on the `gray25` band, hairline underline. */
export const detailHeadCellSx = {
	textAlign: "left",
	fontSize: 12,
	fontWeight: 600,
	color: "text.secondary",
	p: "11px 18px",
	borderBottom: "1px solid",
	borderColor: "divider",
	bgcolor: designTokens.gray25,
	whiteSpace: "nowrap",
} as const;

/**
 * Body cell: 13.5px, warm `gray25` hairline row borders, vertically centered.
 * A fixed `height` keeps rows uniform regardless of content — so a row carrying a
 * 22px chip (e.g. the movements event chip) is the same height as a plain
 * text/number row, both centered.
 */
export const detailBodyCellSx = {
	height: 48,
	p: "12px 18px",
	borderBottom: "1px solid",
	borderColor: designTokens.gray25,
	fontSize: 13.5,
	verticalAlign: "middle",
} as const;

/** Total / summary band cell («Итого» / «Начальный остаток»). */
export const detailTotalCellSx = {
	bgcolor: designTokens.gray25,
	fontWeight: 700,
	borderTop: "1.5px solid",
	borderTopColor: designTokens.gray300,
} as const;

/**
 * Table-level chrome for the class-based detail tables: `.r` right-aligns a
 * cell, `.total` styles a summary row, and the last body row drops its border
 * (the total band / card footer supplies the bottom edge). Composed from the
 * cell fragments above so the per-cell and table-level consumers share one source.
 */
export const detailTableSx = {
	width: "100%",
	borderCollapse: "collapse",
	"& thead th": { ...detailHeadCellSx },
	"& thead th.r": { textAlign: "right" },
	"& tbody td": { ...detailBodyCellSx },
	"& tbody td.r": { textAlign: "right" },
	"& tbody tr:last-child td": { borderBottom: "none" },
	"& tr.total td": { ...detailTotalCellSx },
} as const;
