import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loadable } from "helpers/Loading";
import { numericSx } from "theme";

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
	Tooltip,
} from "@mui/material";

import {
	BODY_CELL_SX,
	compareValues,
	DEFAULT_ROWS_PER_PAGE,
	FOOTER_SX,
	HEADER_CELL_SX,
	HEADER_CONTAINER_SX,
	LOADING_CONTAINER_HEIGHT,
	ROW_SX,
	ROWS_PER_PAGE_OPTIONS,
	TABLE_CONTAINER_SX,
} from "./tableConfigs";

export type SortOrder = "asc" | "desc";

/**
 * A single table column.
 *
 * **Sorting:** every column is sortable by default. A column is sortable when it
 * exposes a sort source — `field` (sort by that row property) or `sortValue` (an
 * explicit accessor for `renderCell`-only columns) — and has not opted out with
 * `sortable: false`. The `actions` column and long free-text / notes columns are
 * never sortable (drop their `field` / `sortValue` or set `sortable: false`).
 * When the table is given `onSort`, sorting is controlled (delegated to the
 * parent / store); otherwise the table sorts itself client-side.
 *
 * **Column-order convention** (left → right — new and edited configs follow it):
 * №/ID → date → primary entity → type/status chip → descriptive → money (right,
 * tabular) → ⋮ actions.
 */
export interface Column<T> {
	key: string;
	field?: keyof T;
	headerName: string;
	/** Optional tooltip shown on the column header. */
	headerTooltip?: string;
	width?: number | string;
	align?: "left" | "right" | "center";
	/** Sortable by default; set `false` to opt out (actions / free-text columns). */
	sortable?: boolean;
	/** Sort accessor for columns without a plain `field` (e.g. `renderCell`-only). */
	sortValue?: (row: T) => string | number | boolean | Date | null | undefined;
	renderCell?: (row: T) => React.ReactNode;
}

/**
 * Initial sort for a table, by column `key`. Convention: **date-desc** on
 * event / feed tables, **name-asc** on master-data tables.
 */
export interface DefaultSort {
	key: string;
	order: SortOrder;
}

export interface DataTableProps<T extends { id: string | number }> {
	rows: Loadable<T[]>;
	columns: Column<T>[];
	className?: string;
	pagination?: boolean;
	rowsPerPageOptions?: number[];
	/** Initial page size; defaults to the first entry of rowsPerPageOptions. */
	defaultRowsPerPage?: number;
	/** Initial sort column + direction (see {@link DefaultSort}). */
	defaultSort?: DefaultSort;
	onRowClick?: (row: T) => void;
	onSort?: (field: keyof T, order: SortOrder) => void;
	/** Empty-state copy; defaults to the localized «Нет записей». */
	emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
	rows,
	columns,
	className,
	pagination = false,
	rowsPerPageOptions = ROWS_PER_PAGE_OPTIONS,
	defaultRowsPerPage,
	defaultSort,
	onRowClick,
	onSort,
	emptyMessage,
}: Readonly<DataTableProps<T>>) {
	const { t } = useTranslation();
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(
		defaultRowsPerPage ?? rowsPerPageOptions[0] ?? DEFAULT_ROWS_PER_PAGE,
	);
	const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key ?? null);
	const [order, setOrder] = useState<SortOrder>(defaultSort?.order ?? "asc");

	// A column is sortable unless it opts out, is the actions column, or has no
	// sort source (neither `sortValue` nor `field`).
	const isSortable = (col: Column<T>) =>
		col.key !== "actions" && col.sortable !== false && (col.sortValue != null || col.field != null);

	const sortedRows = useMemo<Loadable<T[]>>(() => {
		if (rows === "loading") {
			return "loading";
		}
		// Controlled sort (onSort) or no active sort → leave ordering to the caller.
		if (onSort || !sortKey) {
			return rows;
		}
		const col = columns.find((c) => c.key === sortKey);
		const accessor = col?.sortValue ?? (col?.field != null ? (r: T) => r[col.field!] : null);
		if (!accessor) {
			return rows;
		}
		const sorted = [...rows].sort((a, b) => compareValues(accessor(a), accessor(b)));
		return order === "desc" ? sorted.reverse() : sorted;
	}, [rows, onSort, sortKey, order, columns]);

	useEffect(() => {
		if (sortedRows === "loading") {
			return;
		}

		const maxPage = Math.ceil(sortedRows.length / rowsPerPage) - 1;
		if (page > maxPage) {
			setPage(Math.max(0, maxPage));
		}
	}, [sortedRows, rowsPerPage, page]);

	const displayedRows = useMemo<Loadable<T[]>>(() => {
		if (sortedRows === "loading") {
			return "loading";
		}

		return pagination
			? sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
			: sortedRows;
	}, [sortedRows, page, rowsPerPage, pagination]);

	const isSelectable = Boolean(onRowClick);

	const handleRequestSort = (col: Column<T>) => {
		if (!isSortable(col)) {
			return;
		}

		const isAsc = sortKey === col.key && order === "asc";
		const newOrder: SortOrder = isAsc ? "desc" : "asc";
		setOrder(newOrder);
		setSortKey(col.key);

		if (onSort && col.field) {
			onSort(col.field, newOrder); // controlled — parent / store sorts
		}
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
		const label = !isSortable(col) ? (
			col.headerName
		) : (
			<TableSortLabel
				active={sortKey === col.key}
				direction={sortKey === col.key ? order : "asc"}
				onClick={() => handleRequestSort(col)}
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
								sortDirection={isSortable(col) && sortKey === col.key ? order : false}
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
							onClick={() => handleRowClick(row)}
							tabIndex={onRowClick ? 0 : undefined}
							onKeyDown={(e) => handleOnKeyDown(e, row)}
							sx={{
								...ROW_SX,
								cursor: isSelectable ? "pointer" : "default",
							}}
						>
							{columns.map((col) => (
								<TableCell
									key={`${row.id}-${col.key}`}
									align={col.align ?? "left"}
									sx={col.align === "right" ? { ...BODY_CELL_SX, ...numericSx } : BODY_CELL_SX}
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
					{emptyMessage ?? t("common.table.noRecords")}
				</Box>
			)}

			{pagination && rows !== "loading" && rows.length > 0 && (
				<Box sx={FOOTER_SX}>
					<TablePagination
						component="div"
						count={rows.length}
						page={page}
						onPageChange={handlePageChange}
						rowsPerPage={rowsPerPage}
						onRowsPerPageChange={handleRowsPerPageChange}
						rowsPerPageOptions={rowsPerPageOptions}
						labelRowsPerPage={t("common.table.rowsPerPage")}
						labelDisplayedRows={({ from, to, count }) =>
							t("common.table.displayedRows", { from, to, total: count })
						}
					/>
				</Box>
			)}
		</TableContainer>
	);
}
