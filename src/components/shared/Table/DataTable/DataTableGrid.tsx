import React from "react";

import { SxProps, Table, TableBody, Theme } from "@mui/material";

import { isSortableColumn } from "../useTableSort";
import type { Column, SortOrder } from "./DataTable";
import DataTableHead from "./DataTableHead";
import DataTableRow from "./DataTableRow";

interface DataTableGridProps<T extends { id: string | number }> {
	/** The rows to show, already sorted and paged. */
	rows: T[];
	columns: Column<T>[];
	sortKey: string | null;
	order: SortOrder;
	onSort: (key: string) => void;
	/** The row's open action, or `undefined` for a static row. */
	openerOf?: (row: T) => (() => void) | undefined;
	/** Per-row highlight. */
	rowSx?: (row: T) => SxProps<Theme> | undefined;
	/** Sticks the header band to the top of the table's own scroll box (list cards). */
	stickyHeader?: boolean;
	sx?: SxProps<Theme>;
	/** Bands after the rows — the «Итого» / opening-balance total rows. */
	children?: React.ReactNode;
}

/**
 * The table itself — header band, rows, trailing total bands — shared by the
 * list `DataTable` and the detail `DetailTable`, which differ only in the card,
 * scroll and footer around it.
 */
export function DataTableGrid<T extends { id: string | number }>({
	rows,
	columns,
	sortKey,
	order,
	onSort,
	openerOf,
	rowSx,
	stickyHeader = false,
	sx,
	children,
}: Readonly<DataTableGridProps<T>>) {
	return (
		<Table stickyHeader={stickyHeader} size="small" sx={sx}>
			<DataTableHead
				columns={columns}
				sortKey={sortKey}
				order={order}
				isSortable={isSortableColumn}
				onSort={(col) => onSort(col.key)}
			/>
			<TableBody>
				{rows.map((row) => (
					<DataTableRow
						key={row.id}
						row={row}
						columns={columns}
						onOpen={openerOf?.(row)}
						sx={rowSx?.(row)}
					/>
				))}
				{children}
			</TableBody>
		</Table>
	);
}

export default DataTableGrid;
