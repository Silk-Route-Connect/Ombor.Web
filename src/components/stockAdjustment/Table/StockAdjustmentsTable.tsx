import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { TableOrder } from "components/shared/Table/tableOrder";
import { Loadable } from "helpers/Loading";
import { StockAdjustment } from "models/stockAdjustment";

import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { Theme, useMediaQuery } from "@mui/material";

import { buildStockAdjustmentColumns } from "./stockAdjustmentTableConfigs";

interface StockAdjustmentsTableProps {
	rows: Loadable<StockAdjustment[]>;
	isFiltering: boolean;
	/** Whether any adjustment exists at all (drives the empty-state copy). */
	hasAny: boolean;
	onCreate: () => void;
	/** Opens the read-only detail (`/adjustments/:id`). */
	onOpen: (adjustment: StockAdjustment) => void;
	/** Re-runs the failed list load (the error state's «Повторить»). */
	onRetry: () => void;
	/** Error-state title, e.g. «Не удалось загрузить корректировки». */
	errorTitle: string;
	/** Totals of the filtered rows in the footer band. */
	summary?: React.ReactNode;
	/** The page's `useTableOrder()` — its CSV export follows this table's sort. */
	exportOrder?: TableOrder<StockAdjustment>;
}

/**
 * Immutable stock-adjustment history (rule 23 — no edit / delete) on the shared
 * DataTable; a row click (or the № link) opens the read-only audited detail.
 */
export const StockAdjustmentsTable: React.FC<StockAdjustmentsTableProps> = ({
	onRetry,
	errorTitle,
	rows,
	isFiltering,
	hasAny,
	onCreate,
	onOpen,
	summary,
	exportOrder,
}) => {
	const { t } = useTranslation();
	const showAuthor = useMediaQuery((theme: Theme) => theme.breakpoints.up("xl"), { noSsr: true });
	const columns = useMemo(() => buildStockAdjustmentColumns(t, { showAuthor }), [t, showAuthor]);
	const firstRun = !hasAny && !isFiltering;

	return (
		<DataTable<StockAdjustment>
			exportOrder={exportOrder}
			rows={rows}
			columns={columns}
			onRetry={onRetry}
			errorTitle={errorTitle}
			defaultSort={{ key: "date", order: "desc" }}
			onRowClick={onOpen}
			fixedLayout
			summary={summary}
			empty={
				<TableEmptyState
					icon={<TuneOutlinedIcon />}
					title={firstRun ? t("adjustment.empty.title") : t("adjustment.empty.searchTitle")}
					hint={firstRun ? t("adjustment.empty.body") : t("adjustment.empty.searchBody")}
					action={firstRun ? { label: t("adjustment.create"), onClick: onCreate } : undefined}
				/>
			}
		/>
	);
};

export default StockAdjustmentsTable;
