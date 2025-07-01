// src/components/shared/ExpandableDataTable.tsx
import React, { useEffect, useMemo, useState } from "react";
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
	useTheme,
} from "@mui/material";
import { Loadable } from "helpers/Loading";
import { translate } from "i18n/i18n";

import {
	BODY_CELL_SX,
	DEFAULT_ROWS_PER_PAGE,
	HEADER_CELL_SX,
	HEADER_CONTAINER_SX,
	LOADING_CONTAINER_HEIGHT,
	ROWS_PER_PAGE_OPTIONS,
	TABLE_CONTAINER_SX,
} from "./../DataTable/tableConfigs";

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

/**
 * Props for ExpandableDataTable:
 * - rows: Loadable array of items
 * - columns: column definitions
 * - pagination: whether to show paging controls
 * - rowsPerPageOptions: array like [10,25,50]
 * - onRowClick: optional click callback
 * - onSort: optional sort callback
 * - renderExpanded: optional function that returns JSX for each expanded row
 */
export interface ExpandableDataTableProps<T extends { id: string | number }> {
	rows: Loadable<T[]>;
	columns: Column<T>[];
	pagination?: boolean;
	rowsPerPageOptions?: number[];
	onRowClick?: (row: T) => void;
	onSort?: (field: keyof T, order: SortOrder) => void;
	renderExpanded?: (row: T) => React.ReactNode;
	canExpand?: (row: T) => boolean;
	className?: string;
	expandedMaxHeight?: number;
}

export function ExpandableDataTable<T extends { id: string | number }>({
	rows,
	columns,
	pagination = false,
	rowsPerPageOptions = ROWS_PER_PAGE_OPTIONS,
	onRowClick,
	onSort,
	renderExpanded,
	canExpand,
	className,
	expandedMaxHeight = 300,
}: Readonly<ExpandableDataTableProps<T>>) {
	const theme = useTheme();
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0] ?? DEFAULT_ROWS_PER_PAGE);
	const [orderBy, setOrderBy] = useState<keyof T | null>(null);
	const [order, setOrder] = useState<SortOrder>("asc");
	const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());

	console.log(rows);

	// If the total row count changes, ensure current page is valid
	useEffect(() => {
		if (rows === "loading") return;
		const allRows = rows;
		const total = allRows.length;
		const maxPage = Math.max(0, Math.ceil(total / rowsPerPage) - 1);
		if (page > maxPage) {
			setPage(maxPage);
		}
	}, [rows, rowsPerPage, page]);

	const displayedRows = useMemo<Loadable<T[]>>(() => {
		if (rows === "loading") {
			return "loading";
		}
		const allRows = rows;
		if (!pagination) {
			return allRows;
		}
		const start = page * rowsPerPage;
		return allRows.slice(start, start + rowsPerPage);
	}, [rows, page, rowsPerPage, pagination]);

	const isSelectable = Boolean(onRowClick);

	const handleSortRequest = (field: keyof T) => {
		if (!onSort) {
			return;
		}
		const isAsc = orderBy === field && order === "asc";
		const newOrder: SortOrder = isAsc ? "desc" : "asc";
		setOrder(newOrder);
		setOrderBy(field);
		onSort(field, newOrder);
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
		if (!col.sortable || !col.field) {
			return col.headerName;
		}
		return (
			<TableSortLabel
				active={orderBy === col.field}
				direction={orderBy === col.field ? order : "asc"}
				onClick={() => handleSortRequest(col.field!)}
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
			<Table stickyHeader size="small">
				<TableHead sx={HEADER_CONTAINER_SX}>
					<TableRow>
						{renderExpanded && <TableCell padding="checkbox" sx={HEADER_CELL_SX} />}
						{columns.map((col) => (
							<TableCell
								key={col.key}
								sortDirection={col.sortable && orderBy === col.field ? order : false}
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

						const isOdd = index % 2 === 0;
						const baseColor = isOdd ? theme.palette.grey[50] : "inherit";
						const backgroundColor = isOpen ? theme.palette.action.hover : baseColor;

						return (
							<React.Fragment key={row.id}>
								<TableRow
									hover={isSelectable || Boolean(renderExpanded)}
									onClick={() => handleRowClickInternal(row)}
									sx={{
										backgroundColor,
										cursor: isSelectable ? "pointer" : "default",
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
											sx={BODY_CELL_SX}
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
					{translate("noRecords")}
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
