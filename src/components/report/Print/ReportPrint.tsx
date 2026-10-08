import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import PrintDocHeader from "components/shared/Print/PrintDocHeader";
import PrintLayout from "components/shared/Print/PrintLayout";
import PrintOrganizationGate from "components/shared/Print/PrintOrganizationGate";
import PrintTable from "components/shared/Print/PrintTable";
import PrintTotals from "components/shared/Print/PrintTotals";
import { isReady, Loadable } from "helpers/Loading";
import { formatCurrencyMinus, formatQuantity } from "utils/formatCurrency";

import { toPrintColumns, toPrintTotalsRow } from "../View/reportColumns";
import { ReportKpi, ReportView } from "../View/types";

export interface ReportPrintProps<Row extends { id: string }> {
	title: string;
	periodLabel: string | null;
	view: Loadable<ReportView<Row>>;
	/** The report's screen — where back returns on a direct load. */
	backTo: string;
	onRetry: () => void;
	errorTitle: string;
}

/** More columns than this do not fit a portrait A4 at 12px — the report prints landscape. */
const PORTRAIT_MAX_COLUMNS = 6;

const kpiValue = (kpi: ReportKpi, uzs: string): string => {
	if (kpi.format === "count") {
		return formatQuantity(kpi.value);
	}
	return `${formatCurrencyMinus(kpi.value)} ${uzs}`;
};

/**
 * A report on paper (`/reports/:kind/print`): the business header, the report
 * name with its period and grouping, the summary figures, then every row and
 * «Итого» — built from the same view as the screen and the CSV.
 */
export function ReportPrint<Row extends { id: string }>({
	title,
	periodLabel,
	view,
	backTo,
	onRetry,
	errorTitle,
}: Readonly<ReportPrintProps<Row>>) {
	const { t } = useTranslation();
	const ready = isReady(view) ? view : null;
	const columns = useMemo(() => (ready ? toPrintColumns(ready.columns, t) : []), [ready, t]);

	if (ready === null) {
		return (
			<LoadStateView
				state={isReady(view) ? "loading" : view}
				onRetry={onRetry}
				errorTitle={errorTitle}
			/>
		);
	}

	const subtitle = [periodLabel ?? "", ...ready.details].filter(Boolean);
	const uzs = t("common.unit.uzs");

	return (
		<PrintOrganizationGate>
			{(organization) => (
				<PrintLayout
					title={title}
					documentTitle={periodLabel ? `${title} — ${periodLabel}` : title}
					backTo={backTo}
					orientation={columns.length > PORTRAIT_MAX_COLUMNS ? "landscape" : "portrait"}
				>
					<PrintDocHeader organization={organization} title={title} subtitle={subtitle} />
					<PrintTotals
						rows={ready.kpis.map((kpi) => ({
							key: kpi.key,
							label: kpi.caption,
							value: kpiValue(kpi, uzs),
						}))}
						note={ready.costIsEstimated ? t("report.estimatedCost") : undefined}
					/>
					<PrintTable
						columns={columns}
						rows={ready.rows}
						rowKey={(row) => row.id}
						summaryRows={
							ready.rows.length > 0 ? [toPrintTotalsRow(ready.columns, ready.totals, t)] : []
						}
						emptyText={ready.empty.title}
					/>
				</PrintLayout>
			)}
		</PrintOrganizationGate>
	);
}

export default ReportPrint;
