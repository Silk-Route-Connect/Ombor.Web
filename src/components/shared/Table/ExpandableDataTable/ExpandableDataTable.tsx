import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import TablePager from "components/shared/Table/TablePager";
import { isReady, Loadable } from "helpers/Loading";
import { designTokens, numericSx } from "theme";

import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
	Box,
	Collapse,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
} from "@mui/material";

import { Column, DefaultSort, SortOrder } from "../DataTable/DataTable";
import {
	BODY_CELL_SX,
	DEFAULT_ROWS_PER_PAGE,
	HEADER_CELL_SX,
	HEADER_CONTAINER_SX,
	ROWS_PER_PAGE_OPTIONS,
	TABLE_CONTAINER_SX,
	TABLE_SCROLL_SX,
} from "../DataTable/tableConfigs";
import { TableOrder } from "../tableOrder";
import { isSortableColumn, useTableSort } from "../useTableSort";

export type { Column, DefaultSort, SortOrder };

export interface ExpandableDataTableProps<T extends { id: string | number }> {
	rows: Loadable<T[]>;
	/** Same column API as `DataTable` (sorting, alignment, cells). */
	columns: Column<T>[];
	/** 10/25/50 pager; on by default. */
	pagination?: boolean;
	rowsPerPageOptions?: number[];
	defaultSort?: DefaultSort;
	/** The page's `useTableOrder()` — its CSV export then writes rows in this table's order. */
	exportOrder?: TableOrder<T>;
	renderExpanded: (row: T) => React.ReactNode;
	canExpand?: (row: T) => boolean;
	className?: string;
	expandedMaxHeight?: number;
	/** The table's `TableEmptyState`; defaults to «Нет записей». */
	empty?: React.ReactNode;
	/** Re-runs the failed load behind `rows` (the error state's «Повторить»). */
	onRetry?: () => void;
	/** Error-state title, e.g. «Не удалось загрузить шаблоны». */
	errorTitle?: string;
}

/**
 * `DataTable` twin whose rows expand into a detail panel (Templates). A row
 * click, Enter or Space toggles the panel; the chevron does the same.
 */
export function ExpandableDataTable<T extends { id: string | number }>({
	rows,
	columns,
	pagination = true,
	rowsPerPageOptions = ROWS_PER_PAGE_OPTIONS,
	defaultSort,
	exportOrder,
	renderExpanded,
	canExpand,
	className,
	expandedMaxHeight = 300,
	empty,
	onRetry,
	errorTitle,
}: Readonly<ExpandableDataTableProps<T>>) {
	const { t } = useTranslation();
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0] ?? DEFAULT_ROWS_PER_PAGE);
	const { sortKey, order, requestSort, sortRows } = useTableSort(columns, defaultSort, exportOrder);
	const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());

	const sortedRows = useMemo<Loadable<T[]>>(
		() => (isReady(rows) ? sortRows(rows) : rows),
		[rows, sortRows],
	);

	useEffect(() => {
		if (!isReady(sortedRows)) return;
		const maxPage = Math.max(0, Math.ceil(sortedRows.length / rowsPerPage) - 1);
		if (page > maxPage) {
			setPage(maxPage);
		}
	}, [sortedRows, rowsPerPage, page]);

	const displayedRows = useMemo<Loadable<T[]>>(() => {
		if (!isReady(sortedRows) || !pagination) {
			return sortedRows;
		}
		const start = page * rowsPerPage;
		return sortedRows.slice(start, start + rowsPerPage);
	}, [sortedRows, page, rowsPerPage, pagination]);

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

	if (isReady(rows) && rows.length === 0) {
		return (
			<Paper elevation={1} className={className} sx={TABLE_CONTAINER_SX}>
				{empty ?? (
					<TableEmptyState icon={<InboxOutlinedIcon />} title={t("common.table.noRecords")} />
				)}
			</Paper>
		);
	}

	if (!isReady(displayedRows) || !isReady(sortedRows)) {
		return (
			<Paper elevation={1} className={className} sx={TABLE_CONTAINER_SX}>
				<LoadStateView
					state={isReady(displayedRows) ? "loading" : displayedRows}
					size="section"
					onRetry={onRetry}
					errorTitle={errorTitle}
				/>
			</Paper>
		);
	}

	return (
		<Paper elevation={1} className={className} sx={TABLE_CONTAINER_SX}>
			<TableContainer sx={TABLE_SCROLL_SX}>
				<Table stickyHeader size="small" sx={{ width: "100%" }}>
					<TableHead sx={HEADER_CONTAINER_SX}>
						<TableRow>
							<TableCell padding="checkbox" sx={HEADER_CELL_SX} />
							{columns.map((col) => (
								<TableCell
									key={col.key}
									sortDirection={isSortableColumn(col) && sortKey === col.key ? order : false}
									sx={{ ...HEADER_CELL_SX, width: col.width }}
									align={col.align ?? "left"}
								>
									{isSortableColumn(col) ? (
										<TableSortLabel
											active={sortKey === col.key}
											direction={sortKey === col.key ? order : "asc"}
											onClick={() => requestSort(col.key)}
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
						{displayedRows.map((row, index) => {
							const isExpandable = canExpand ? canExpand(row) : true;
							const isOpen = isExpandable && expandedRows.has(row.id);

							return (
								<React.Fragment key={row.id}>
									<TableRow
										tabIndex={isExpandable ? 0 : undefined}
										aria-expanded={isExpandable ? isOpen : undefined}
										onClick={() => isExpandable && toggleExpandRow(row.id)}
										onKeyDown={(e) => {
											if (
												isExpandable &&
												e.target === e.currentTarget &&
												(e.key === "Enter" || e.key === " ")
											) {
												e.preventDefault();
												toggleExpandRow(row.id);
											}
										}}
										sx={{
											// Zebra by data index — the collapse rows interleave with the data rows.
											bgcolor: isOpen
												? "action.selected"
												: index % 2 === 1
													? designTokens.gray25
													: "inherit",
											"&:hover": { bgcolor: "action.hover" },
											cursor: isExpandable ? "pointer" : "default",
										}}
									>
										<TableCell padding="checkbox">
											{isExpandable && (
												<IconButton
													size="medium"
													sx={{ p: 0 }}
													aria-label={t(isOpen ? "common.collapse" : "common.expand")}
													onClick={(e) => {
														e.stopPropagation();
														toggleExpandRow(row.id);
													}}
												>
													{isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
												</IconButton>
											)}
										</TableCell>

										{columns.map((col) => (
											<TableCell
												key={`${row.id}-${col.key}`}
												align={col.align ?? "left"}
												sx={
													col.align === "right" ? { ...BODY_CELL_SX, ...numericSx } : BODY_CELL_SX
												}
											>
												{col.renderCell
													? col.renderCell(row)
													: col.field != null
														? (row[col.field] as unknown as React.ReactNode)
														: null}
											</TableCell>
										))}
									</TableRow>

									{isExpandable && (
										<TableRow>
											<TableCell sx={{ py: 0 }} colSpan={columns.length + 1}>
												<Collapse in={isOpen} timeout="auto" unmountOnExit>
													<Box sx={{ m: 1, maxHeight: expandedMaxHeight, overflowY: "auto" }}>
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
			</TableContainer>

			{pagination && (
				<TablePager
					count={sortedRows.length}
					page={page}
					rowsPerPage={rowsPerPage}
					rowsPerPageOptions={rowsPerPageOptions}
					onPageChange={setPage}
					onRowsPerPageChange={(next) => {
						setRowsPerPage(next);
						setPage(0);
					}}
				/>
			)}
		</Paper>
	);
}
