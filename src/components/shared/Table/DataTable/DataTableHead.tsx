import React from "react";

import { Box, TableCell, TableHead, TableRow, TableSortLabel, Tooltip } from "@mui/material";

import type { Column, SortOrder } from "./DataTable";
import { HEADER_CELL_SX, HEADER_CONTAINER_SX } from "./tableConfigs";

interface DataTableHeadProps<T> {
	columns: Column<T>[];
	sortKey: string | null;
	order: SortOrder;
	isSortable: (col: Column<T>) => boolean;
	onSort: (col: Column<T>) => void;
}

/** The sticky header band of `DataTable`: sort labels, header tooltips, column widths. */
export function DataTableHead<T>({
	columns,
	sortKey,
	order,
	isSortable,
	onSort,
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

		return (
			<Tooltip title={col.headerTooltip} placement="top">
				<Box component="span" sx={{ display: "inline-flex" }}>
					{label}
				</Box>
			</Tooltip>
		);
	};

	return (
		<TableHead sx={HEADER_CONTAINER_SX}>
			<TableRow>
				{columns.map((col) => (
					<TableCell
						key={col.key}
						sortDirection={isSortable(col) && sortKey === col.key ? order : false}
						sx={{ ...HEADER_CELL_SX, width: col.width }}
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
