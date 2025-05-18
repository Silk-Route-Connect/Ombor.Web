import React, { useEffect, useMemo, useState } from "react";
import {
	Box,
	CircularProgress,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TableSortLabel,
} from "@mui/material";
import { Loadable } from "helpers/Loading";

import {
	BODY_CELL_SX,
	DEFAULT_ROWS_PER_PAGE,
	HEADER_CELL_SX,
	HEADER_CONTAINER_SX,
	LOADING_CONTAINER_HEIGHT,
	ROWS_PER_PAGE_OPTIONS,
	TABLE_CONTAINER_SX,
} from "./tableConfigs";

export type SortOrder = "asc" | "desc";

export interface Column<T> {
	key: string;
	field?: keyof T;
	headerName: string;
	width?: number | string;
	align?: "left" | "right" | "center";
	sortable?: boolean;
	renderCell?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T extends { id: string | number }> {
	rows: Loadable<T[]>;
	columns: Column<T>[];
	className?: string;
	pagination?: boolean;
	rowsPerPageOptions?: number[];
	onRowClick?: (row: T) => void;
	onSort?: (field: keyof T, order: SortOrder) => void;
}

export function DataTable<T extends { id: string | number }>({
	rows,
	columns,
	className,
	pagination = false,
	rowsPerPageOptions = ROWS_PER_PAGE_OPTIONS,
	onRowClick,
	onSort,
}: Readonly<DataTableProps<T>>) {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0] ?? DEFAULT_ROWS_PER_PAGE);
	const [orderBy, setOrderBy] = useState<keyof T | null>(null);
	const [order, setOrder] = useState<SortOrder>("asc");

	useEffect(() => {
		if (rows === "loading") {
			return;
		}

		const maxPage = Math.ceil(rows.length / rowsPerPage) - 1;
		if (page > maxPage) {
			setPage(Math.max(0, maxPage));
		}
	}, [rows, rowsPerPage, page]);

	const displayedRows = useMemo<Loadable<T[]>>(() => {
		if (rows === "loading") {
			return "loading";
		}

		return pagination ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : rows;
	}, [rows, page, rowsPerPage, pagination]);

	const isSelectable = Boolean(onRowClick);

	const handleRequestSort = (field?: keyof T) => {
		if (!field || !onSort) {
			return;
		}

		const isAsc = orderBy === field && order === "asc";
		const newOrder: SortOrder = isAsc ? "desc" : "asc";
		setOrder(newOrder);
		setOrderBy(field);
		onSort(field, newOrder);
	};

	const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);

	const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(e.target.value, 10));
		setPage(0);
	};

	const handleRowClick = (row: T) => onRowClick?.(row);

	const handleOnKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, row: T) => {
		if (e.key === "Enter") {
			onRowClick?.(row);
		}
	};

	const renderCell = (row: T, col: Column<T>) => {
		if (col.renderCell) {
			return col.renderCell(row);
		}

		if (col.field != null) {
			return row[col.field] as unknown as React.ReactNode;
		}

		return null;
	};

	const renderColumn = (col: Column<T>) => {
		if (!col.sortable || !col.field) {
			return col.headerName;
		}

		return (
			<TableSortLabel
				active={orderBy === col.field}
				direction={orderBy === col.field ? order : "asc"}
				onClick={() => handleRequestSort(col.field)}
			>
				{col.headerName}
			</TableSortLabel>
		);
	};

	if (displayedRows === "loading") {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				height={LOADING_CONTAINER_HEIGHT}
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<TableContainer component={Paper} elevation={1} className={className} sx={TABLE_CONTAINER_SX}>
			<Table stickyHeader size="small">
				<TableHead sx={HEADER_CONTAINER_SX}>
					<TableRow>
						{columns.map((col) => (
							<TableCell
								key={col.key}
								sortDirection={col.sortable && orderBy === col.field ? order : false}
								sx={{ ...HEADER_CELL_SX, width: col.width }}
								align={col.align ?? "left"}
							>
								{renderColumn(col)}
							</TableCell>
						))}
					</TableRow>
				</TableHead>

				<TableBody>
					{displayedRows.map((row) => (
						<TableRow
							key={row.id}
							hover={isSelectable}
							onClick={() => handleRowClick(row)}
							tabIndex={onRowClick ? 0 : undefined}
							onKeyDown={(e) => handleOnKeyDown(e, row)}
							sx={{
								"&:nth-of-type(odd)": { bgcolor: "grey.50" },
								"&:hover": { bgcolor: "action.selected" },
								cursor: isSelectable ? "pointer" : "default",
							}}
						>
							{columns.map((col) => (
								<TableCell
									key={`${row.id}-${col.key}`}
									align={col.align ?? "left"}
									sx={BODY_CELL_SX}
								>
									{renderCell(row, col)}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>

			{rows !== "loading" && rows.length === 0 && (
				<Box p={4} textAlign="center" color="text.secondary" fontStyle="italic">
					Нет записей
				</Box>
			)}

			{pagination && rows !== "loading" && (
				<TablePagination
					component="div"
					count={rows.length}
					page={page}
					onPageChange={handlePageChange}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={handleRowsPerPageChange}
					rowsPerPageOptions={rowsPerPageOptions}
					sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}
				/>
			)}
		</TableContainer>
	);
}
