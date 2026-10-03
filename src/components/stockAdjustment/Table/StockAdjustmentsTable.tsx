import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import StockAdjustmentDetailModal from "components/stockAdjustment/Detail/StockAdjustmentDetailModal";
import { Loadable } from "helpers/Loading";
import { StockAdjustment } from "models/stockAdjustment";

import ScaleOutlinedIcon from "@mui/icons-material/ScaleOutlined";

import { buildStockAdjustmentColumns } from "./stockAdjustmentTableConfigs";

interface StockAdjustmentsTableProps {
	rows: Loadable<StockAdjustment[]>;
	isFiltering: boolean;
	/** Whether any adjustment exists at all (drives the empty-state copy). */
	hasAny: boolean;
	onCreate: () => void;
	/** Re-runs the failed list load (the error state's «Повторить»). */
	onRetry: () => void;
	/** Error-state title, e.g. «Не удалось загрузить корректировки». */
	errorTitle: string;
	/** Totals of the filtered rows in the footer band. */
	summary?: React.ReactNode;
}

/**
 * Immutable stock-adjustment history (rule 23 — no edit / delete) on the shared
 * DataTable; a row click (or the №) opens the read-only audited detail modal.
 */
export const StockAdjustmentsTable: React.FC<StockAdjustmentsTableProps> = ({
	onRetry,
	errorTitle,
	rows,
	isFiltering,
	hasAny,
	onCreate,
	summary,
}) => {
	const { t } = useTranslation();
	const [selected, setSelected] = useState<StockAdjustment | null>(null);
	const columns = useMemo(() => buildStockAdjustmentColumns(t, setSelected), [t]);
	const firstRun = !hasAny && !isFiltering;

	return (
		<>
			<DataTable<StockAdjustment>
				rows={rows}
				columns={columns}
				onRetry={onRetry}
				errorTitle={errorTitle}
				defaultSort={{ key: "date", order: "desc" }}
				onRowClick={setSelected}
				fixedLayout
				summary={summary}
				empty={
					<TableEmptyState
						icon={<ScaleOutlinedIcon />}
						title={firstRun ? t("adjustment.empty.title") : t("adjustment.empty.searchTitle")}
						hint={firstRun ? t("adjustment.empty.body") : t("adjustment.empty.searchBody")}
						action={firstRun ? { label: t("adjustment.create"), onClick: onCreate } : undefined}
					/>
				}
			/>
			<StockAdjustmentDetailModal adjustment={selected} onClose={() => setSelected(null)} />
		</>
	);
};

export default StockAdjustmentsTable;
