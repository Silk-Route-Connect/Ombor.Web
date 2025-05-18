import React, { useEffect, useMemo } from "react";
import { Box, TableSortLabel } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Loadable } from "helpers/Loading";

import styles from "./DataTable.module.scss";

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
		const maxPage = Math.ceil(rows.length / rowsPerPage) - 1;

		if (page > maxPage) {
			setPage(Math.max(0, maxPage));
		}
	}, [rows.length, rowsPerPage]);

	const displayedRows = useMemo(() => {
		if (rows === "loading") {
			return "loading";
		}

		return pagination ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : rows;
	}, [rows, page, rowsPerPage, pagination]);

	const isSelectable = useMemo(() => {
		if (onRowClick) {
			return true;
		}
		return false;
	}, [onRowClick]);

	const handleRequestSort = (field?: keyof T) => {
		if (!field || !onSort) {
			return;
		}

		const isAsc = orderBy === field && order === "asc";
		setOrder(isAsc ? "desc" : "asc");
		setOrderBy(field);

		onSort(field, isAsc ? "desc" : "asc");
	};

	const handlePageChange = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (
		event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleRowClick = (row: T) => {
		if (onRowClick) {
			onRowClick(row);
		}
	};

	const handleOnKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, row: T) => {
		if (onRowClick && e.key === "Enter") {
			onRowClick(row);
		}
	};

	const rendercell = (row: T, col: Column<T>) => {
		if (col.renderCell) {
			return col.renderCell(row);
		}

		if (col.field != null) {
			return row[col.field] as unknown as React.ReactNode;
		}

		return null;
	};

	if (displayedRows === "loading") {
		return (
			<div className={styles.loadingContainer}>
				<CircularProgress />
			</div>
		);
	}

	return (
		<>
			<TableContainer component={Paper} className={`${styles.tableContainer} ${className}`}>
				<Table>
					<TableHead>
						<TableRow>
							{columns.map((col) => (
								<TableCell
									key={col.key}
									sortDirection={col.sortable && orderBy === col.field ? order : false}
									sx={col.width ? { width: col.width } : undefined}
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
								className={isSelectable ? styles.selectableRow : ""}
								onClick={() => handleRowClick(row)}
								tabIndex={onRowClick ? 0 : undefined}
								onKeyDown={(e) => handleOnKeyDown(e, row)}
							>
								{columns.map((col) => (
									<TableCell key={`${row.id}-${col.key}`} align={col.align ?? "left"}>
										{rendercell(row, col)}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{rows.length === 0 && (
				<Box p={4} textAlign="center">
					Нет записей
				</Box>
			)}

			{pagination && (
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
