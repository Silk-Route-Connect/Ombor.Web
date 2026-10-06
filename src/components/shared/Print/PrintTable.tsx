import React from "react";

import { Box } from "@mui/material";

import { PRINT_RULE_COLOR, printNumberSx } from "./printStyles";

export interface PrintColumn<T> {
	key: string;
	header: string;
	align?: "left" | "right" | "center";
	/** CSS width of the column («8%», 40) — the rest share the remaining space. */
	width?: string | number;
	render: (row: T, index: number) => React.ReactNode;
}

/**
 * A totals / balance row around the body. The label spans every column before
 * the first column that has a cell; later columns show their cell (or stay empty).
 */
export interface PrintSummaryRow {
	key: string;
	label: string;
	cells: Partial<Record<string, React.ReactNode>>;
	strong?: boolean;
}

interface PrintTableProps<T> {
	columns: PrintColumn<T>[];
	rows: T[];
	rowKey: (row: T, index: number) => string | number;
	/** Rows above the body — e.g. the opening balance. */
	leadRows?: PrintSummaryRow[];
	/** Rows below the body — e.g. turnover and the closing balance. */
	summaryRows?: PrintSummaryRow[];
	/** One spanning line when there are no rows. */
	emptyText: string;
}

const cellSx = (align: PrintColumn<unknown>["align"] = "left") => ({
	border: "1px solid",
	borderColor: PRINT_RULE_COLOR,
	p: "4px 6px",
	fontSize: 12,
	verticalAlign: "top",
	textAlign: align,
	...(align === "right" ? printNumberSx : undefined),
});

/**
 * The bordered table of a printed document. A real `<table>`, so the browser
 * repeats the header row on every page and keeps a row from splitting across
 * pages. Not for screens — on-screen tables use `DataTable` / `DetailTable`.
 */
export function PrintTable<T>({
	columns,
	rows,
	rowKey,
	leadRows = [],
	summaryRows = [],
	emptyText,
}: PrintTableProps<T>): React.ReactElement {
	const renderSummary = (row: PrintSummaryRow) => {
		const first = columns.findIndex((col) => row.cells[col.key] !== undefined);
		const span = first < 1 ? columns.length : first;
		return (
			<Box component="tr" key={row.key} sx={{ breakInside: "avoid" }}>
				<Box component="td" colSpan={span} sx={{ ...cellSx(), fontWeight: row.strong ? 700 : 600 }}>
					{row.label}
				</Box>
				{columns.slice(span).map((col) => (
					<Box
						component="td"
						key={col.key}
						sx={{ ...cellSx(col.align), fontWeight: row.strong ? 700 : 600 }}
					>
						{row.cells[col.key]}
					</Box>
				))}
			</Box>
		);
	};

	return (
		<Box
			component="table"
			sx={{ width: "100%", borderCollapse: "collapse", mb: "12px", tableLayout: "auto" }}
		>
			<Box component="thead">
				<Box component="tr">
					{columns.map((col) => (
						<Box
							component="th"
							key={col.key}
							sx={{ ...cellSx(col.align), width: col.width, fontWeight: 700 }}
						>
							{col.header}
						</Box>
					))}
				</Box>
			</Box>
			<Box component="tbody">
				{leadRows.map(renderSummary)}
				{rows.length === 0 ? (
					<Box component="tr">
						<Box
							component="td"
							colSpan={columns.length}
							sx={{ ...cellSx("center"), color: "text.secondary" }}
						>
							{emptyText}
						</Box>
					</Box>
				) : (
					rows.map((row, index) => (
						<Box component="tr" key={rowKey(row, index)} sx={{ breakInside: "avoid" }}>
							{columns.map((col) => (
								<Box component="td" key={col.key} sx={cellSx(col.align)}>
									{col.render(row, index)}
								</Box>
							))}
						</Box>
					))
				)}
				{summaryRows.map(renderSummary)}
			</Box>
		</Box>
	);
}

export default PrintTable;
