import React from "react";
import { numericSx } from "theme";

import { SxProps, TableCell, TableRow, Theme } from "@mui/material";

import { BODY_CELL_SX, rowChromeSx, TOTAL_CELL_SX } from "../tableChrome";
import type { Column } from "./DataTable";

const toSxArray = (sx: SxProps<Theme> | undefined) =>
	sx == null ? [] : Array.isArray(sx) ? sx : [sx];

/** Body cell chrome for a column: right-aligned columns read in tabular figures. */
export const bodyCellSx = (align: Column<unknown>["align"]): SxProps<Theme> =>
	align === "right" ? { ...BODY_CELL_SX, ...numericSx } : BODY_CELL_SX;

/** A column's cell content: its `renderCell`, else the plain `field` value. */
export function renderColumnCell<T>(row: T, col: Column<T>): React.ReactNode {
	if (col.renderCell) {
		return col.renderCell(row);
	}
	return col.field != null ? (row[col.field] as unknown as React.ReactNode) : null;
}

interface DataTableRowProps<T> {
	row: T;
	columns: Column<T>[];
	/** Opens (or toggles) the row on click, Enter or Space; a row without it is static. */
	onOpen?: () => void;
	/** A cell before the columns (the expand chevron of `ExpandableDataTable`). */
	leading?: React.ReactNode;
	/** `aria-expanded` of an expandable row. */
	expanded?: boolean;
	/** Per-row highlight (an open row, the ledger's opening balance). */
	sx?: SxProps<Theme>;
}

/** One body row of every table — list and detail tables share its chrome and keyboard. */
export function DataTableRow<T>({
	row,
	columns,
	onOpen,
	leading,
	expanded,
	sx,
}: Readonly<DataTableRowProps<T>>) {
	// Only a key pressed on the row itself opens it — Enter on a link or button
	// inside the row belongs to that control.
	const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
		if (!onOpen || e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) {
			return;
		}
		e.preventDefault();
		onOpen();
	};

	return (
		<TableRow
			tabIndex={onOpen ? 0 : undefined}
			aria-expanded={expanded}
			onClick={onOpen}
			onKeyDown={handleKeyDown}
			sx={[...toSxArray(rowChromeSx(Boolean(onOpen))), ...toSxArray(sx)]}
		>
			{leading}
			{columns.map((col) => (
				<TableCell key={col.key} align={col.align ?? "left"} sx={bodyCellSx(col.align)}>
					{renderColumnCell(row, col)}
				</TableCell>
			))}
		</TableRow>
	);
}

interface DataTableTotalRowProps<T> {
	columns: Column<T>[];
	/** The band's cells by column key; a column without one stays empty. */
	cells: Partial<Record<string, React.ReactNode>>;
}

/**
 * The pinned «Итого» band after the last body row — never sorted or paged with
 * the rows it totals.
 */
export function DataTableTotalRow<T>({ columns, cells }: Readonly<DataTableTotalRowProps<T>>) {
	return (
		<TableRow sx={rowChromeSx(false)}>
			{columns.map((col) => (
				<TableCell
					key={col.key}
					align={col.align ?? "left"}
					sx={[...toSxArray(bodyCellSx(col.align)), ...toSxArray(TOTAL_CELL_SX)]}
				>
					{cells[col.key] ?? null}
				</TableCell>
			))}
		</TableRow>
	);
}

export default DataTableRow;
