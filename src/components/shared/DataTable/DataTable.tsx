import React, { useEffect, useMemo } from "react";
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
	className = "",
	pagination = false,
	rowsPerPageOptions = [10, 25, 50],
	onRowClick,
	onSort,
}: Readonly<DataTableProps<T>>) {
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageOptions[0] ?? 5);
	const [orderBy, setOrderBy] = React.useState<keyof T | null>(null);
	const [order, setOrder] = React.useState<SortOrder>("asc");

	useEffect(() => {
		if (rows !== "loading") {
			const maxPage = Math.ceil(rows.length / rowsPerPage) - 1;
			if (page > maxPage) {
				setPage(Math.max(0, maxPage));
			}
		}
	}, [rows, rowsPerPage, page]);

	const displayedRows = useMemo<Loadable<T[]>>(() => {
		if (rows === "loading") return "loading";
		return pagination ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : rows;
	}, [rows, page, rowsPerPage, pagination]);

	const isSelectable = Boolean(onRowClick);

	const handleRequestSort = (field?: keyof T) => {
		if (!field || !onSort) return;
		const isAsc = orderBy === field && order === "asc";
		const newOrder: SortOrder = isAsc ? "desc" : "asc";
		setOrder(newOrder);
		setOrderBy(field);
		onSort(field, newOrder);
	};

	const handlePageChange = (_: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleRowClick = (row: T) => {
		onRowClick?.(row);
	};

	const handleOnKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, row: T) => {
		if (e.key === "Enter") {
			onRowClick?.(row);
		}
	};

	const renderCell = (row: T, col: Column<T>) => {
		if (col.renderCell) return col.renderCell(row);
		if (col.field != null) return row[col.field] as unknown as React.ReactNode;
		return null;
	};

	if (displayedRows === "loading") {
		return (
			<Box display="flex" justifyContent="center" p={2}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<>
			<TableContainer component={Paper} className={className}>
				<Table>
					<TableHead>
						<TableRow>
							{columns.map((col) => (
								<TableCell
									key={col.key}
									sortDirection={col.sortable && orderBy === col.field ? order : false}
									sx={col.width ? { width: col.width } : undefined}
									align={col.align ?? "left"}
								>
									{col.sortable && col.field ? (
										<TableSortLabel
											active={orderBy === col.field}
											direction={orderBy === col.field ? order : "asc"}
											onClick={() => handleRequestSort(col.field)}
										>
											{col.headerName}
										</TableSortLabel>
									) : (
										col.headerName
									)}
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
								sx={isSelectable ? { cursor: "pointer" } : undefined}
							>
								{columns.map((col) => (
									<TableCell key={`${row.id}-${col.key}`} align={col.align ?? "left"}>
										{renderCell(row, col)}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{rows !== "loading" && rows.length === 0 && (
				<Box p={4} textAlign="center">
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
		</>
	);
}
