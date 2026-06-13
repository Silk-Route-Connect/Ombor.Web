import { designTokens, numericSx } from "theme";

/**
 * Styling for the detail page's data tables per the bundle's `.prod-tbl`:
 * muted 12px headers on surface-sub, 13.5px body cells with hairline rows,
 * and a bold surface-sub total row.
 *
 * These read-only, non-paginated, total-bearing tables intentionally do NOT use
 * the shared `DataTable` (which exists for the sortable/paginated list views) —
 * they mirror the prototype's static `.prod-tbl` and carry «Итого»/«Начальный
 * остаток» summary rows the generic table can't express.
 */
export const detailTableSx = {
	width: "100%",
	borderCollapse: "collapse",
	"& thead th": {
		textAlign: "left",
		fontSize: 12,
		fontWeight: 600,
		color: "text.secondary",
		p: "11px 18px",
		borderBottom: 1,
		borderColor: "divider",
		bgcolor: designTokens.gray25,
	},
	"& thead th.r": { textAlign: "right" },
	"& tbody td": {
		p: "12px 18px",
		borderBottom: "1px solid",
		borderColor: designTokens.gray25,
		fontSize: 13.5,
	},
	"& tbody td.r": { textAlign: "right" },
	"& tbody tr:last-child td": { borderBottom: "none" },
	"& tr.total td": {
		bgcolor: designTokens.gray25,
		fontWeight: 700,
		borderTop: "1.5px solid",
		borderTopColor: designTokens.gray300,
	},
} as const;

/** Tabular numeric cell content (`.prod-tbl .num`). */
export const numCellSx = { ...numericSx } as const;

/** Leading icon for a detail card title (`.sd-card-title` icon). */
export const cardIconSx = { fontSize: 17, color: "text.secondary" } as const;

/** Stock-in / stock-out emphasis (`.qin` / `.qout`). */
export const quantityInSx = { ...numericSx, color: "success.main", fontWeight: 700 } as const;
export const quantityOutSx = { ...numericSx, color: "error.main", fontWeight: 700 } as const;
