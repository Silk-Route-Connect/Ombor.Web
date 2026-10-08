import { BODY_CELL_SX, TOTAL_CELL_SX } from "components/shared/Table/tableChrome";

/**
 * Table-level chrome of `DetailTable` for the plain `<tr className="total">`
 * footer rows its consumers append («Итого» / «Начальный остаток»): they take
 * the shared body cell and total band (`tableChrome`), and `.r` right-aligns a
 * cell. Header and body rows are the shared `DataTableHead` / `DataTableRow`.
 */
export const detailTableSx = {
	"& tr.total td": { ...BODY_CELL_SX, ...TOTAL_CELL_SX },
	"& td.r": { textAlign: "right" },
} as const;
