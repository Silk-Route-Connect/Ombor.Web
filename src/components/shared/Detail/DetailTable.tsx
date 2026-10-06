import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Column, DefaultSort } from "components/shared/Table/DataTable/DataTable";
import {
	DEFAULT_ROWS_PER_PAGE,
	FOOTER_SX,
	ROWS_PER_PAGE_OPTIONS,
} from "components/shared/Table/DataTable/tableConfigs";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { TableOrder } from "components/shared/Table/tableOrder";
import TablePager from "components/shared/Table/TablePager";
import { isSortableColumn, useTableSort } from "components/shared/Table/useTableSort";
import { numericSx } from "theme";

import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { Box, SxProps, Theme } from "@mui/material";

import DetailSortHeader from "./DetailSortHeader";
import { detailTableSx } from "./detailTableChrome";

const toSxArray = (sx: SxProps<Theme> | undefined) =>
	sx == null ? [] : Array.isArray(sx) ? sx : [sx];

interface DetailTableProps<T extends { id: string | number }> {
	rows: T[];
	/** Same column API as the list `DataTable` (sorting, alignment, shared cells). */
	columns: Column<T>[];
	defaultSort?: DefaultSort;
	/** The tab's `useTableOrder()` — its CSV export then writes rows in this table's order. */
	exportOrder?: TableOrder<T>;
	onRowClick?: (row: T) => void;
	/** Rows that do not open anything (e.g. the ledger's opening balance). */
	isRowClickable?: (row: T) => boolean;
	/** Per-row highlight (e.g. the opening-balance row). */
	rowSx?: (row: T) => SxProps<Theme> | undefined;
	/** 10/25/50 pager under the table. Off for short line tables with a total band. */
	pagination?: boolean;
	/** Total band: `<tr className="total">` rows appended to the body. */
	footer?: React.ReactNode;
	/** The tab's `TableEmptyState`; defaults to «Нет записей». */
	empty?: React.ReactNode;
	/** Totals of the shown rows (`TableTotals`) in the footer band, left of the pager. */
	summary?: React.ReactNode;
}

/**
 * The detail-embedded table (pattern 20d): warm header band, 52px rows, an
 * optional total band or pager — driven by the same `Column<T>` configs and
 * shared cells as list tables. Headers sort from the keyboard; clickable rows
 * open on click, Enter or Space.
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
}: Readonly<DetailTableProps<T>>) {
	const { t } = useTranslation();
	const { sortKey, order, requestSort, sortRows } = useTableSort(columns, defaultSort, exportOrder);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0] ?? DEFAULT_ROWS_PER_PAGE);

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

	return (
		<>
			<Box sx={{ overflowX: "auto" }}>
				<Box component="table" sx={detailTableSx}>
					<thead>
						<tr>
							{columns.map((col) =>
								isSortableColumn(col) ? (
									<DetailSortHeader
										key={col.key}
										col={col.key}
										label={col.headerName}
										tooltip={col.headerTooltip}
										active={sortKey === col.key}
										dir={order}
										onSort={requestSort}
										align={col.align === "right" ? "right" : "left"}
										sx={{ width: col.width }}
									/>
								) : (
									<Box
										component="th"
										key={col.key}
										className={col.align === "right" ? "r" : undefined}
										sx={{ width: col.width }}
									>
										{col.headerName}
									</Box>
								),
							)}
						</tr>
					</thead>
					<tbody>
						{visible.map((row) => {
							const clickable = Boolean(onRowClick) && (isRowClickable?.(row) ?? true);
							return (
								<Box
									component="tr"
									key={row.id}
									tabIndex={clickable ? 0 : undefined}
									onClick={clickable ? () => onRowClick?.(row) : undefined}
									onKeyDown={(e: React.KeyboardEvent) => {
										if (
											clickable &&
											e.target === e.currentTarget &&
											(e.key === "Enter" || e.key === " ")
										) {
											e.preventDefault();
											onRowClick?.(row);
										}
									}}
									sx={[
										...(clickable
											? [{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }]
											: []),
										...toSxArray(rowSx?.(row)),
									]}
								>
									{columns.map((col) => (
										<Box
											component="td"
											key={col.key}
											className={col.align === "right" ? "r" : undefined}
											sx={col.align === "right" ? numericSx : undefined}
										>
											{col.renderCell
												? col.renderCell(row)
												: col.field != null
													? (row[col.field] as unknown as React.ReactNode)
													: null}
										</Box>
									))}
								</Box>
							);
						})}
						{footer}
					</tbody>
				</Box>
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
