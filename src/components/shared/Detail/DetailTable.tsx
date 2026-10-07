import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Column, DefaultSort } from "components/shared/Table/DataTable/DataTable";
import DataTableGrid from "components/shared/Table/DataTable/DataTableGrid";
import { FOOTER_SX } from "components/shared/Table/tableChrome";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { TableOrder } from "components/shared/Table/tableOrder";
import TablePager from "components/shared/Table/TablePager";
import { useRowsPerPage } from "components/shared/Table/useRowsPerPage";
import { useTableSort } from "components/shared/Table/useTableSort";

import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { Box, SxProps, Theme } from "@mui/material";

import { detailTableSx } from "./detailTableChrome";

interface DetailTableProps<T extends { id: string | number }> {
	rows: T[];
	/** Same column API as the list `DataTable` (sorting, alignment, shared cells). */
	columns: Column<T>[];
	defaultSort?: DefaultSort;
	/** The tab's `useTableOrder()` — its CSV export then writes rows in this table's order. */
	exportOrder?: TableOrder<T>;
	/** Opens a row (click, Enter, Space). Without it rows are static — no hover wash, no pointer. */
	onRowClick?: (row: T) => void;
	/** Rows that do not open anything (e.g. the ledger's opening balance). */
	isRowClickable?: (row: T) => boolean;
	/** Per-row highlight (e.g. the opening-balance row). */
	rowSx?: (row: T) => SxProps<Theme> | undefined;
	/** 25/50/100 pager under the table. Off for short line tables with a total band. */
	pagination?: boolean;
	/** Total band: `<tr className="total">` rows appended to the body (`.r` right-aligns a cell). */
	footer?: React.ReactNode;
	/** The tab's `TableEmptyState`; defaults to «Нет записей». */
	empty?: React.ReactNode;
	/** Totals of the shown rows (`TableTotals`) in the footer band, left of the pager. */
	summary?: React.ReactNode;
	/**
	 * Names this table among the tabs of its page, so each remembers its own page
	 * size (`useRowsPerPage`); a page with one paged table leaves it out.
	 */
	storageKey?: string;
}

/**
 * The detail-embedded table (pattern 20d): the list `DataTable`'s header band,
 * rows and total band (`tableChrome`) inside a detail card, with an optional
 * total band or pager — driven by the same `Column<T>` configs and shared cells
 * as list tables. Headers sort from the keyboard; clickable rows open on click,
 * Enter or Space.
 */
export function DetailTable<T extends { id: string | number }>({
	rows,
	columns,
	defaultSort,
	exportOrder,
	onRowClick,
	isRowClickable,
	rowSx,
	pagination = false,
	footer,
	empty,
	summary,
	storageKey,
}: Readonly<DetailTableProps<T>>) {
	const { t } = useTranslation();
	const { sortKey, order, requestSort, sortRows } = useTableSort(columns, defaultSort, exportOrder);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useRowsPerPage("detail", { tableKey: storageKey });

	const sorted = useMemo(() => sortRows(rows), [rows, sortRows]);

	// A narrowed result set (search, filters) starts again on the first page.
	useEffect(() => {
		setPage(0);
	}, [rows.length]);

	const visible = pagination
		? sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
		: sorted;

	if (rows.length === 0) {
		return (
			<>
				{empty ?? (
					<TableEmptyState icon={<InboxOutlinedIcon />} title={t("common.table.noRecords")} />
				)}
			</>
		);
	}

	const openerOf = (row: T) =>
		onRowClick && (isRowClickable?.(row) ?? true) ? () => onRowClick(row) : undefined;

	return (
		<>
			<Box sx={{ overflowX: "auto" }}>
				<DataTableGrid<T>
					rows={visible}
					columns={columns}
					sortKey={sortKey}
					order={order}
					onSort={requestSort}
					openerOf={openerOf}
					rowSx={rowSx}
					sx={detailTableSx}
				>
					{footer}
				</DataTableGrid>
			</Box>
			{pagination ? (
				<TablePager
					count={rows.length}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={setPage}
					onRowsPerPageChange={(next) => {
						setRowsPerPage(next);
						setPage(0);
					}}
					summary={summary}
				/>
			) : (
				summary && <Box sx={FOOTER_SX}>{summary}</Box>
			)}
		</>
	);
}

export default DetailTable;
