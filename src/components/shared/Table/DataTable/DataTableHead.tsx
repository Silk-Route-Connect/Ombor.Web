import React from "react";
import InfoHint from "components/shared/InfoHint/InfoHint";

import { Box, TableCell, TableHead, TableRow, TableSortLabel } from "@mui/material";

import { HEAD_CELL_SX, HEADER_CONTAINER_SX } from "../tableChrome";
import type { Column, SortOrder } from "./DataTable";

/** Width of a leading control column (the expand chevron of `ExpandableDataTable`). */
export const LEADING_COLUMN_WIDTH = 56;

interface DataTableHeadProps<T> {
	columns: Column<T>[];
	sortKey: string | null;
	order: SortOrder;
	isSortable: (col: Column<T>) => boolean;
	onSort: (col: Column<T>) => void;
	/** Reserves an empty header cell above a leading control column (expand chevrons). */
	leadingColumn?: boolean;
}

/**
 * The header band of every table — `DataTable`, `ExpandableDataTable` and
 * `DetailTable`: sort labels, «i» header hints after the label, column widths.
 */
export function DataTableHead<T>({
	columns,
	sortKey,
	order,
	isSortable,
	onSort,
	leadingColumn = false,
}: Readonly<DataTableHeadProps<T>>) {
	const renderLabel = (col: Column<T>) => {
		const label = !isSortable(col) ? (
			col.headerName
		) : (
			<TableSortLabel
				active={sortKey === col.key}
				direction={sortKey === col.key ? order : "asc"}
				onClick={() => onSort(col)}
			>
				{col.headerName}
			</TableSortLabel>
		);

		if (!col.headerTooltip) {
			return label;
		}

		// A visible, keyboard-reachable «i» explains the term, never a hover-only label.
		return (
			<Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
				{label}
				<InfoHint text={col.headerTooltip} />
			</Box>
		);
	};

	return (
		<TableHead sx={HEADER_CONTAINER_SX}>
			<TableRow>
				{leadingColumn && <TableCell sx={{ ...HEAD_CELL_SX, width: LEADING_COLUMN_WIDTH }} />}
				{columns.map((col) => (
					<TableCell
						key={col.key}
						sortDirection={isSortable(col) && sortKey === col.key ? order : false}
						sx={{ ...HEAD_CELL_SX, width: col.width }}
						align={col.align ?? "left"}
					>
						{renderLabel(col)}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

export default DataTableHead;
