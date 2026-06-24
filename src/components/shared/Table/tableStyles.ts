/**
 * Canonical cell styles for the hand-rolled module tables (Employees, Payments,
 * Wallets, Debt) so they share one source of truth and stay consistent with each
 * other — and, via the `grey.100` header, with the shared `DataTable` family
 * (Products, Categories, Transfers, Partners). Resolves the cross-module table
 * inconsistency (F-025). To restyle every list table, edit these in one place.
 */
export const tableHeadCellSx = {
	textAlign: "left",
	fontSize: 12,
	fontWeight: 600,
	color: "text.secondary",
	p: "11px 16px",
	borderBottom: "1px solid",
	borderColor: "divider",
	whiteSpace: "nowrap",
	bgcolor: "grey.100",
} as const;

export const tableBodyCellSx = {
	p: "13px 16px",
	borderBottom: "1px solid",
	borderColor: "divider",
	fontSize: 13.5,
	verticalAlign: "middle",
} as const;
