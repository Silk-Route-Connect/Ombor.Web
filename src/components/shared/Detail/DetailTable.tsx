import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Column, DefaultSort, SortOrder } from "components/shared/Table/DataTable/DataTable";
import {
	compareValues,
	DEFAULT_ROWS_PER_PAGE,
	ROWS_PER_PAGE_OPTIONS,
} from "components/shared/Table/DataTable/tableConfigs";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import TablePager from "components/shared/Table/TablePager";
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
	onRowClick,
	isRowClickable,
	rowSx,
	pagination = false,
	footer,
	empty,
}: Readonly<DetailTableProps<T>>) {
	const { t } = useTranslation();
	const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key ?? null);
	const [order, setOrder] = useState<SortOrder>(defaultSort?.order ?? "asc");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0] ?? DEFAULT_ROWS_PER_PAGE);

	const isSortable = (col: Column<T>) =>
		col.key !== "actions" && col.sortable !== false && (col.sortValue != null || col.field != null);

	const sorted = useMemo(() => {
		const col = columns.find((c) => c.key === sortKey);
		const accessor = col?.sortValue ?? (col?.field != null ? (r: T) => r[col.field!] : null);
		if (!accessor) {
			return rows;
		}
		const asc = [...rows].sort((a, b) => compareValues(accessor(a), accessor(b)));
		return order === "desc" ? asc.reverse() : asc;
	}, [rows, columns, sortKey, order]);

	// A narrowed result set (search, filters) starts again on the first page.
	useEffect(() => {
		setPage(0);
	}, [rows.length]);

	const visible = pagination
		? sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
		: sorted;

	const handleSort = (key: string) => {
		setOrder(sortKey === key && order === "asc" ? "desc" : "asc");
		setSortKey(key);
	};

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
								isSortable(col) ? (
									<DetailSortHeader
										key={col.key}
										col={col.key}
										label={col.headerName}
										tooltip={col.headerTooltip}
										active={sortKey === col.key}
										dir={order}
										onSort={handleSort}
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
			{pagination && (
				<TablePager
					count={rows.length}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={setPage}
					onRowsPerPageChange={(next) => {
						setRowsPerPage(next);
						setPage(0);
					}}
				/>
			)}
		</>
	);
}

export default DetailTable;
