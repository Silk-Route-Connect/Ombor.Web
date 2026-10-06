import React from "react";
import ExportButton from "components/shared/Buttons/ExportButton";
import TableToolbar from "components/shared/Table/TableToolbar";
import { radius } from "theme";

import { Paper } from "@mui/material";

interface DetailTableCardProps {
	/** Free-text search, first in the band. */
	search?: { value: string; onChange: (value: string) => void; placeholder: string };
	/** Filter dropdowns between the search box and the export button. */
	filters?: React.ReactNode;
	/** CSV of the rows the tab currently shows (never disabled — see ExportButton). */
	exportCsv?: { onExport: () => void; rowCount: number };
	/** Optional band under the toolbar (the ledger legend). */
	legend?: React.ReactNode;
	/** A `DetailTable` (which renders its own empty state and pager). */
	children: React.ReactNode;
}

/**
 * One bordered unit per detail tab (pattern 14): the in-card toolbar band
 * (search · filters · export) above the tab's table — the same band on every
 * detail page, so «this toolbar shapes this table» reads the same everywhere.
 */
export const DetailTableCard: React.FC<DetailTableCardProps> = ({
	search,
	filters,
	exportCsv,
	legend,
	children,
}) => (
	<Paper
		elevation={1}
		sx={{ border: 1, borderColor: "divider", borderRadius: `${radius.lg}px`, overflow: "hidden" }}
	>
		{(search || filters || exportCsv) && (
			<TableToolbar
				search={search && { ...search, dense: true }}
				filters={filters}
				actions={exportCsv && <ExportButton {...exportCsv} />}
				sx={{ mb: 0, p: "12px 14px", borderBottom: 1, borderColor: "divider" }}
			/>
		)}
		{legend}
		{children}
	</Paper>
);

export default DetailTableCard;
