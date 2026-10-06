import React from "react";
import { useTranslation } from "react-i18next";

import { Box, TablePagination } from "@mui/material";

import { FOOTER_SX } from "./tableChrome";

interface TablePagerProps {
	count: number;
	page: number;
	rowsPerPage: number;
	onPageChange: (page: number) => void;
	onRowsPerPageChange: (rowsPerPage: number) => void;
	rowsPerPageOptions?: number[];
	/** Left of the pager in the same band — the list's `TableTotals`. */
	summary?: React.ReactNode;
}

const DEFAULT_OPTIONS = [10, 25, 50];

/**
 * The footer band of every table: the 10/25/50 pager (ru-localized via common
 * keys), with an optional totals summary on its left. A list that fits on one
 * page shows no pager — only its totals band, if it has one — instead of dead
 * «1–1 из 1 ‹ ›» controls under a short table.
 */
export const TablePager: React.FC<TablePagerProps> = ({
	count,
	page,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange,
	rowsPerPageOptions = DEFAULT_OPTIONS,
	summary,
}) => {
	const { t } = useTranslation();

	if (count <= Math.min(...rowsPerPageOptions)) {
		return summary ? <Box sx={FOOTER_SX}>{summary}</Box> : null;
	}

	const pager = (
		<TablePagination
			component="div"
			count={count}
			page={page}
			rowsPerPage={rowsPerPage}
			rowsPerPageOptions={rowsPerPageOptions}
			onPageChange={(_, nextPage) => onPageChange(nextPage)}
			onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
			labelRowsPerPage={t("common.table.rowsPerPage")}
			labelDisplayedRows={({ from, to, count: total }) =>
				t("common.table.displayedRows", { from, to, total })
			}
			sx={summary ? { ml: "auto" } : FOOTER_SX}
		/>
	);

	if (!summary) {
		return pager;
	}

	return (
		<Box sx={{ ...FOOTER_SX, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
			{summary}
			{pager}
		</Box>
	);
};

export default TablePager;
