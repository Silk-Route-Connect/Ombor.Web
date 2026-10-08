import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { isReady, Loadable } from "helpers/Loading";

import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { Box, Paper, TableContainer } from "@mui/material";

import { FOOTER_SX } from "../tableChrome";
import { TableOrder } from "../tableOrder";
import TablePager from "../TablePager";
import { useRowsPerPage } from "../useRowsPerPage";
import { useTableSort } from "../useTableSort";
import DataTableGrid from "./DataTableGrid";
import { DataTableTotalRow } from "./DataTableRow";
import {
	fixedTableSx,
	ROWS_PER_PAGE_OPTIONS,
	TABLE_CONTAINER_SX,
	TABLE_SCROLL_SX,
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
 * The table sorts client-side (`useTableSort`); a page's CSV export follows the
 * same order through `exportOrder`.
 *
 * **Column-order convention** (left → right — new and edited configs follow it):
 * №/ID → date → primary entity → type/status chip → descriptive → money (right,
 * tabular) → ⋮ actions.
 */
export interface Column<T> {
	key: string;
	field?: keyof T;
	headerName: string;
	/** One plain sentence behind an «i» (`InfoHint`) beside the header. */
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
	/** 25/50/100 pager; on by default — pass `false` only with a documented reason. */
	pagination?: boolean;
	rowsPerPageOptions?: readonly number[];
	/** Initial page size; defaults to 25 (or the smallest of `rowsPerPageOptions`). */
	defaultRowsPerPage?: number;
	/** Initial sort column + direction (see {@link DefaultSort}). */
	defaultSort?: DefaultSort;
	/** Opens a row (click, Enter, Space). Without it rows are static — no hover wash, no pointer. */
	onRowClick?: (row: T) => void;
	/** The page's `useTableOrder()` — its CSV export then writes rows in this table's order. */
	exportOrder?: TableOrder<T>;
	/** The table's `TableEmptyState` (first-run vs filtered copy); defaults to «Нет записей». */
	empty?: React.ReactNode;
	/** Re-runs the failed load behind `rows` (the error state's «Повторить»). */
	onRetry?: () => void;
	/** Error-state title, e.g. «Не удалось загрузить партнёров». */
	errorTitle?: string;
	/** Totals of the filtered rows (`TableTotals`) in the footer band, left of the pager. */
	summary?: React.ReactNode;
	/**
	 * A pinned «Итого» band after the last row, by column key (e.g. a report's
	 * served totals) — not sorted or paged with the rows.
	 */
	totalRow?: Partial<Record<string, React.ReactNode>>;
	/**
	 * Fixed column widths (`COLUMN_WIDTH` on the narrow columns, names share the
	 * rest): a search or filter that narrows the rows never re-flows the columns.
	 */
	fixedLayout?: boolean;
	/**
	 * Names this table among several on one page, so each remembers its own page
	 * size (`useRowsPerPage`); a page with one table leaves it out.
	 */
	storageKey?: string;
}

export function DataTable<T extends { id: string | number }>({
	rows,
	columns,
	className,
	pagination = true,
	rowsPerPageOptions = ROWS_PER_PAGE_OPTIONS,
	defaultRowsPerPage,
	defaultSort,
	onRowClick,
	exportOrder,
	empty,
	onRetry,
	errorTitle,
	summary,
	totalRow,
	fixedLayout = false,
	storageKey,
}: Readonly<DataTableProps<T>>) {
	const { t } = useTranslation();
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useRowsPerPage("list", {
		options: rowsPerPageOptions,
		initial: defaultRowsPerPage,
		tableKey: storageKey,
	});
	const { sortKey, order, requestSort, sortRows } = useTableSort(columns, defaultSort, exportOrder);

	const sortedRows = useMemo<Loadable<T[]>>(
		() => (isReady(rows) ? sortRows(rows) : rows),
		[rows, sortRows],
	);

	useEffect(() => {
		if (!isReady(sortedRows)) {
			return;
		}

		const maxPage = Math.ceil(sortedRows.length / rowsPerPage) - 1;
		if (page > maxPage) {
			setPage(Math.max(0, maxPage));
		}
	}, [sortedRows, rowsPerPage, page]);

	const displayedRows = useMemo<Loadable<T[]>>(() => {
		if (!isReady(sortedRows)) {
			return sortedRows;
		}

		return pagination
			? sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
			: sortedRows;
	}, [sortedRows, page, rowsPerPage, pagination]);

	const tableSx = useMemo(
		() => (fixedLayout ? fixedTableSx(columns.map((col) => col.width)) : undefined),
		[fixedLayout, columns],
	);

	const handleRowsPerPageChange = (next: number) => {
		setRowsPerPage(next);
		setPage(0);
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

	if (!isReady(displayedRows)) {
		return (
			<Paper elevation={1} className={className} sx={TABLE_CONTAINER_SX}>
				<LoadStateView
					state={displayedRows}
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
				<DataTableGrid<T>
					rows={displayedRows}
					columns={columns}
					sortKey={sortKey}
					order={order}
					onSort={requestSort}
					openerOf={onRowClick && ((row) => () => onRowClick(row))}
					stickyHeader
					sx={tableSx}
				>
					{totalRow && <DataTableTotalRow columns={columns} cells={totalRow} />}
				</DataTableGrid>
			</TableContainer>

			{pagination && isReady(rows) ? (
				<TablePager
					count={rows.length}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={setPage}
					onRowsPerPageChange={handleRowsPerPageChange}
					rowsPerPageOptions={rowsPerPageOptions}
					summary={summary}
				/>
			) : (
				summary && <Box sx={FOOTER_SX}>{summary}</Box>
			)}
		</Paper>
	);
}
