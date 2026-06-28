import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box, Paper, TablePagination } from "@mui/material";

interface DetailTablePagination {
	count: number;
	page: number;
	rowsPerPage: number;
	rowsPerPageOptions: number[];
	onPageChange: (page: number) => void;
	onRowsPerPageChange: (rowsPerPage: number) => void;
}

interface DetailTableCardProps {
	/** Free-text search lives inside the widget header (DSN-2 in-widget pattern). */
	search: { value: string; onChange: (value: string) => void; placeholder: string };
	/** Filter dropdowns rendered between the search box and the export button. */
	filters?: React.ReactNode;
	onExport: () => void;
	exportDisabled?: boolean;
	/** Optional band under the toolbar (the ledger legend folds in here). */
	legend?: React.ReactNode;
	/** Table or empty state. */
	children: React.ReactNode;
	/** Footer pager — omit on un-paginated content (e.g. empty states). */
	pagination?: DetailTablePagination;
}

/**
 * Bordered detail-tab table widget: search · filters · export in one in-widget
 * header band, the table body, and a footer pager — the DSN-2 self-contained
 * table unit shared by the Журнал / Транзакции / Платежи tabs (no separate
 * filter block floating above the card).
 */
export const DetailTableCard: React.FC<DetailTableCardProps> = ({
	search,
	filters,
	onExport,
	exportDisabled,
	legend,
	children,
	pagination,
}) => {
	const { t } = useTranslation();

	return (
		<Paper
			elevation={1}
			sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1.25,
					flexWrap: "wrap",
					p: "12px 14px",
					borderBottom: "1px solid",
					borderColor: "divider",
				}}
			>
				<SearchInput
					value={search.value}
					onChange={search.onChange}
					placeholder={search.placeholder}
					sx={{ width: { xs: "100%", sm: 240 } }}
				/>
				{filters}
				<Box sx={{ flexGrow: 1 }} />
				<GhostButton
					icon={<FileDownloadOutlinedIcon sx={{ fontSize: "16px !important" }} />}
					onClick={onExport}
					disabled={exportDisabled}
				>
					{t("partner.detail.exportCsv")}
				</GhostButton>
			</Box>

			{legend}

			{children}

			{pagination && pagination.count > 0 && (
				<Box
					sx={{
						borderTop: "1px solid",
						borderColor: "divider",
						"& .MuiTablePagination-root": { borderBottom: "none" },
					}}
				>
					<TablePagination
						component="div"
						count={pagination.count}
						page={pagination.page}
						onPageChange={(_, page) => pagination.onPageChange(page)}
						rowsPerPage={pagination.rowsPerPage}
						onRowsPerPageChange={(e) =>
							pagination.onRowsPerPageChange(parseInt(e.target.value, 10))
						}
						rowsPerPageOptions={pagination.rowsPerPageOptions}
						labelRowsPerPage={t("common.table.rowsPerPage")}
						labelDisplayedRows={({ from, to, count }) =>
							t("common.table.displayedRows", { from, to, total: count })
						}
					/>
				</Box>
			)}
		</Paper>
	);
};

export default DetailTableCard;
