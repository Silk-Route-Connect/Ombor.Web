import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loadable } from "helpers/Loading";
import { designTokens, numericSx } from "theme";

import {
	KeyboardArrowDown as KeyboardArrowDownIcon,
	KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import {
	Box,
	CircularProgress,
	Collapse,
	IconButton,
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

import {
	BODY_CELL_SX,
	compareValues,
	DEFAULT_ROWS_PER_PAGE,
	FOOTER_SX,
	HEADER_CELL_SX,
	HEADER_CONTAINER_SX,
	LOADING_CONTAINER_HEIGHT,
	ROWS_PER_PAGE_OPTIONS,
	TABLE_CONTAINER_SX,
} from "../DataTable/tableConfigs";

export type SortOrder = "asc" | "desc";

/**
 * A single table column. Sorting mirrors {@link Column} in the shared
 * `DataTable`: sortable by default when the column exposes a sort source
 * (`field` or `sortValue`) and has not opted out with `sortable: false`.
 */
export interface Column<T> {
	key: string;
	field?: keyof T;
	headerName: string;
	width?: number | string;
	align?: "left" | "right" | "center";
	/** Sortable by default; set `false` to opt out. */
	sortable?: boolean;
	/** Sort accessor for columns without a plain `field` (e.g. `renderCell`-only). */
	sortValue?: (row: T) => string | number | boolean | Date | null | undefined;
	renderCell?: (row: T) => React.ReactNode;
}

/** Initial sort for a table, by column `key`. */
export interface DefaultSort {
	key: string;
	order: SortOrder;
}

/**
 * Props for ExpandableDataTable:
 * - rows: Loadable array of items
 * - columns: column definitions
 * - pagination: whether to show paging controls
 * - rowsPerPageOptions: array like [10,25,50]
 * - defaultSort: initial sort column + direction
 * - onRowClick: optional click callback
 * - onSort: optional controlled-sort callback (delegates ordering to the caller)
 * - renderExpanded: optional function that returns JSX for each expanded row
 */
export interface ExpandableDataTableProps<T extends { id: string | number }> {
	rows: Loadable<T[]>;
	columns: Column<T>[];
	pagination?: boolean;
	rowsPerPageOptions?: number[];
	defaultSort?: DefaultSort;
	onRowClick?: (row: T) => void;
	onSort?: (field: keyof T, order: SortOrder) => void;
	renderExpanded?: (row: T) => React.ReactNode;
	canExpand?: (row: T) => boolean;
	/** Toggle the expand row on a whole-row click, not just the chevron (for
	 *  rows whose only action is to expand — i.e. no `onRowClick` navigation). */
	expandOnRowClick?: boolean;
	className?: string;
	expandedMaxHeight?: number;
	tableLayout?: "auto" | "fixed";
}

export function ExpandableDataTable<T extends { id: string | number }>({
	rows,
	columns,
	pagination = false,
	rowsPerPageOptions = ROWS_PER_PAGE_OPTIONS,
	defaultSort,
	onRowClick,
	onSort,
	renderExpanded,
	canExpand,
	expandOnRowClick = false,
	className,
	expandedMaxHeight = 300,
	tableLayout = "auto",
}: Readonly<ExpandableDataTableProps<T>>) {
	const { t } = useTranslation();
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0] ?? DEFAULT_ROWS_PER_PAGE);
	const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key ?? null);
	const [order, setOrder] = useState<SortOrder>(defaultSort?.order ?? "asc");
	const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());

	const isSortable = (col: Column<T>) =>
		col.key !== "actions" && col.sortable !== false && (col.sortValue != null || col.field != null);

	const sortedRows = useMemo<Loadable<T[]>>(() => {
		if (rows === "loading") {
			return "loading";
		}
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
		if (sortedRows === "loading") return;
		const maxPage = Math.max(0, Math.ceil(sortedRows.length / rowsPerPage) - 1);
		if (page > maxPage) {
			setPage(maxPage);
		}
	}, [sortedRows, rowsPerPage, page]);

	const displayedRows = useMemo<Loadable<T[]>>(() => {
		if (sortedRows === "loading") {
			return "loading";
		}
		if (!pagination) {
			return sortedRows;
		}
		const start = page * rowsPerPage;
		return sortedRows.slice(start, start + rowsPerPage);
	}, [sortedRows, page, rowsPerPage, pagination]);

	const isSelectable = Boolean(onRowClick);

	const handleSortRequest = (col: Column<T>) => {
		if (!isSortable(col)) {
			return;
		}
		const isAsc = sortKey === col.key && order === "asc";
		const newOrder: SortOrder = isAsc ? "desc" : "asc";
		setOrder(newOrder);
		setSortKey(col.key);
		if (onSort && col.field) {
			onSort(col.field, newOrder);
		}
	};

	const handlePageChange = (_: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(e.target.value, 10));
		setPage(0);
	};

	const handleRowClickInternal = (row: T) => {
		onRowClick?.(row);
	};

	const toggleExpandRow = (id: string | number) => {
		setExpandedRows((prev) => {
			const copy = new Set(prev);
			if (copy.has(id)) {
				copy.delete(id);
			} else {
				copy.add(id);
			}
			return copy;
		});
	};

	const renderCellContent = (row: T, col: Column<T>) => {
		if (col.renderCell) {
			return col.renderCell(row);
		}
		if (col.field != null) {
			return row[col.field] as unknown as React.ReactNode;
		}
		return null;
	};

	const renderHeaderCell = (col: Column<T>) => {
		if (!isSortable(col)) {
			return col.headerName;
		}
		return (
			<TableSortLabel
				active={sortKey === col.key}
				direction={sortKey === col.key ? order : "asc"}
				onClick={() => handleSortRequest(col)}
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

	const totalRows = displayedRows.length;
	const hasNoData = totalRows === 0 && rows !== "loading";
	return (
		<TableContainer component={Paper} elevation={1} className={className} sx={TABLE_CONTAINER_SX}>
			<Table stickyHeader size="small" sx={{ tableLayout: tableLayout, width: "100%" }}>
				<TableHead sx={HEADER_CONTAINER_SX}>
					<TableRow>
						{renderExpanded && <TableCell padding="checkbox" sx={{ ...HEADER_CELL_SX }} />}
						{columns.map((col) => (
							<TableCell
								key={col.key}
								sortDirection={isSortable(col) && sortKey === col.key ? order : false}
								sx={{ ...HEADER_CELL_SX, width: col.width }}
								align={col.align ?? "left"}
							>
								{renderHeaderCell(col)}
							</TableCell>
						))}
					</TableRow>
				</TableHead>

				<TableBody>
					{displayedRows.map((row, index) => {
						const isExpandable = renderExpanded && (canExpand ? canExpand(row) : true);
						const isOpen = isExpandable ? expandedRows.has(row.id) : false;
						const rowExpands = Boolean(expandOnRowClick && isExpandable);

						return (
							<React.Fragment key={row.id}>
								<TableRow
									onClick={() => {
										handleRowClickInternal(row);
										if (rowExpands) {
											toggleExpandRow(row.id);
										}
									}}
									sx={{
										// DSN-1 body: open row carries the selected tint, even rows zebra,
										// teal hover. (Zebra is by data index because the collapse rows
										// interleave with the data rows.)
										bgcolor: isOpen
											? "action.selected"
											: index % 2 === 1
												? designTokens.gray25
												: "inherit",
										"&:hover": { bgcolor: "action.hover" },
										cursor: isSelectable || rowExpands ? "pointer" : "default",
									}}
								>
									{isExpandable ? (
										<TableCell padding="checkbox">
											<IconButton
												size="medium"
												sx={{ p: 0 }}
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													toggleExpandRow(row.id);
												}}
											>
												{isOpen ? (
													<KeyboardArrowUpIcon fontSize="medium" />
												) : (
													<KeyboardArrowDownIcon fontSize="medium" />
												)}
											</IconButton>
										</TableCell>
									) : (
										<TableCell padding="checkbox"></TableCell>
									)}

									{columns.map((col) => (
										<TableCell
											key={`${row.id}-${col.key}`}
											align={col.align ?? "left"}
											sx={col.align === "right" ? { ...BODY_CELL_SX, ...numericSx } : BODY_CELL_SX}
										>
											{renderCellContent(row, col)}
										</TableCell>
									))}
								</TableRow>

								{isExpandable && (
									<TableRow>
										<TableCell
											style={{ paddingBottom: 0, paddingTop: 0 }}
											colSpan={columns.length + 1}
										>
											<Collapse in={isOpen} timeout="auto" unmountOnExit>
												<Box sx={{ margin: 1, maxHeight: expandedMaxHeight, overflowY: "auto" }}>
													{renderExpanded(row)}
												</Box>
											</Collapse>
										</TableCell>
									</TableRow>
								)}
							</React.Fragment>
						);
					})}
				</TableBody>
			</Table>

			{hasNoData && (
				<Box p={4} textAlign="center" color="text.secondary" fontStyle="italic">
					{t("noRecords")}
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
					/>
				</Box>
			)}
		</TableContainer>
	);
}
