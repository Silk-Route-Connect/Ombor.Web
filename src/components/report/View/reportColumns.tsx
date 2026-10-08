import React from "react";
import { PrintColumn, PrintSummaryRow } from "components/shared/Print/PrintTable";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import NoValue from "components/shared/Table/cells/NoValue";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { TFunction } from "i18next";
import { numericSx } from "theme";
import { CsvColumn } from "utils/exportToCsv";
import { formatCurrencyMinus, formatPercent, formatQuantity } from "utils/formatCurrency";
import { measurementShort } from "utils/productUtils";

import { Box } from "@mui/material";

import { ReportCellKind, ReportColumn } from "./types";

const isNumeric = (kind: ReportCellKind): boolean => kind !== "text";

const asNumber = (value: string | number | null): number | null =>
	typeof value === "number" && Number.isFinite(value) ? value : null;

function defaultCell<Row>(column: ReportColumn<Row>, row: Row): React.ReactNode {
	const raw = column.value(row);
	const value = asNumber(raw);
	switch (column.kind) {
		case "money":
			// Any figure below zero reads «−…» (a week with more refunds than sales has a
			// negative Выручка); only a `signed` profit turns red.
			if (value !== null && value < 0) {
				return (
					<MoneyCell
						value={-value}
						negative
						tone={column.signed ? "expense" : column.tone}
						main={column.main}
					/>
				);
			}
			return <MoneyCell value={value} main={column.main} tone={column.tone} />;
		case "count":
		case "quantity":
			return <QuantityCell value={value} measurement={column.measurement?.(row)} />;
		case "percent":
			return value === null ? (
				<NoValue />
			) : (
				<Box component="span" sx={numericSx}>
					{formatPercent(value)} %
				</Box>
			);
		default:
			return raw ?? <NoValue />;
	}
}

/** The report's columns for the on-screen `DataTable` (sorted by the raw figure). */
export function toTableColumns<Row>(columns: ReportColumn<Row>[]): Column<Row>[] {
	return columns.map((column) => ({
		key: column.key,
		headerName: column.header,
		headerTooltip: column.hint,
		align: isNumeric(column.kind) ? "right" : "left",
		sortValue: (row: Row) => (column.sort ?? column.value)(row),
		renderCell: (row: Row) => (column.cell ? column.cell(row) : defaultCell(column, row)),
	}));
}

/** One figure as printed text: money «−15 000», quantities «12 шт», «37,9 %», «—» for none. */
export function formatReportValue(
	kind: ReportCellKind,
	raw: string | number | null | undefined,
	t: TFunction,
	unit?: string,
): string {
	if (raw == null || raw === "") {
		return t("common.dash");
	}
	if (typeof raw === "string") {
		return raw;
	}
	switch (kind) {
		case "money":
			return formatCurrencyMinus(raw);
		case "percent":
			return `${formatPercent(raw)} %`;
		case "count":
		case "quantity":
			return unit ? `${formatQuantity(raw)} ${unit}` : formatQuantity(raw);
		default:
			return String(raw);
	}
}

/** The report's columns on paper. */
export function toPrintColumns<Row>(
	columns: ReportColumn<Row>[],
	t: TFunction,
): PrintColumn<Row>[] {
	return columns.map((column) => ({
		key: column.key,
		header: column.header,
		align: isNumeric(column.kind) ? "right" : "left",
		render: (row: Row) => {
			const measurement = column.measurement?.(row);
			const unit =
				measurement && measurement !== "None" ? measurementShort(t, measurement) : undefined;
			return formatReportValue(column.kind, column.value(row), t, unit);
		},
	}));
}

/** The «Итого» row on paper — the label spans the columns that have no total. */
export function toPrintTotalsRow<Row>(
	columns: ReportColumn<Row>[],
	totals: Partial<Record<string, number>>,
	t: TFunction,
): PrintSummaryRow {
	const cells: Partial<Record<string, string>> = {};
	columns.forEach((column, index) => {
		const value = totals[column.key];
		if (index > 0 && value !== undefined) {
			cells[column.key] = formatReportValue(column.kind, value, t);
		}
	});
	return { key: "total", label: t("report.total"), cells, strong: true };
}

/**
 * The «Итого» band of the on-screen table — the same figures as the print and
 * CSV totals row, on the shared total-band chrome. A loss total reads red, as
 * its column does.
 */
export function toTableTotalsRow<Row>(
	columns: ReportColumn<Row>[],
	totals: Partial<Record<string, number>>,
	t: TFunction,
): Partial<Record<string, React.ReactNode>> {
	const cells: Partial<Record<string, React.ReactNode>> = {};
	columns.forEach((column, index) => {
		const value = totals[column.key];
		if (index === 0) {
			cells[column.key] = t("report.total");
		} else if (value !== undefined) {
			cells[column.key] = (
				<Box
					component="span"
					sx={{
						whiteSpace: "nowrap",
						color: column.signed && value < 0 ? "error.main" : undefined,
					}}
				>
					{formatReportValue(column.kind, value, t)}
				</Box>
			);
		}
	});
	return cells;
}

type CsvLine = Record<string, string | number | null>;

/**
 * The report as CSV lines: every row in the table's order, then «Итого» under
 * the first column with each column's total (numbers stay plain numbers).
 */
export function toCsv<Row>(
	columns: ReportColumn<Row>[],
	rows: Row[],
	totals: Partial<Record<string, number>>,
	totalLabel: string,
): { columns: CsvColumn<CsvLine>[]; lines: CsvLine[] } {
	const lines: CsvLine[] = rows.map((row) =>
		Object.fromEntries(columns.map((column) => [column.key, column.value(row)])),
	);
	if (rows.length > 0) {
		lines.push(
			Object.fromEntries(
				columns.map((column, index) => [
					column.key,
					index === 0 ? totalLabel : (totals[column.key] ?? null),
				]),
			),
		);
	}
	return {
		columns: columns.map((column) => ({
			header: column.header,
			value: (line: CsvLine) => line[column.key],
		})),
		lines,
	};
}
