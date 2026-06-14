import React from "react";
import { useTranslation } from "react-i18next";

import { TablePagination } from "@mui/material";

interface TablePagerProps {
	count: number;
	page: number;
	rowsPerPage: number;
	onPageChange: (page: number) => void;
	onRowsPerPageChange: (rowsPerPage: number) => void;
	rowsPerPageOptions?: number[];
}

const DEFAULT_OPTIONS = [10, 25, 50];

/**
 * Pagination footer for the bespoke tables that can't use the shared DataTable
 * (those carrying totals rows or expandable rows). ru-localized via common keys.
 */
export const TablePager: React.FC<TablePagerProps> = ({
	count,
	page,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange,
	rowsPerPageOptions = DEFAULT_OPTIONS,
}) => {
	const { t } = useTranslation();

	return (
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
			sx={{ borderTop: 1, borderColor: "divider" }}
		/>
	);
};

export default TablePager;
