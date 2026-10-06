import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ExportButton from "components/shared/Buttons/ExportButton";
import GhostButton from "components/shared/Buttons/GhostButton";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { DataTable } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { useTableOrder } from "components/shared/Table/tableOrder";
import TableToolbar from "components/shared/Table/TableToolbar";
import TableTotals from "components/shared/Table/TableTotals";
import { isReady, Loadable } from "helpers/Loading";
import { PATHS } from "routing/paths";
import { exportToCsv } from "utils/exportToCsv";

import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import { Alert } from "@mui/material";

import ReportChart from "../Chart/ReportChart";
import { toCsv, toTableColumns, toTableTotalsRow } from "../View/reportColumns";
import { ReportView } from "../View/types";
import ReportKpiRow from "./ReportKpiRow";

export interface ReportScreenProps<Row extends { id: string }> {
	title: string;
	/** «01.10.2026 – 04.10.2026», or «На 04.10.2026» for today's stock; null until loaded. */
	periodLabel: string | null;
	view: Loadable<ReportView<Row>>;
	filters: React.ReactNode;
	/** CSV base name («report-sales_2026-10-01_2026-10-04»). */
	exportName: string;
	onPrint: () => void;
	onRetry: () => void;
	errorTitle: string;
}

/**
 * One report on screen: back to «Отчёты» · title · period, «Печать» and
 * «Экспорт» on the title row (pattern 11), the filter row, then the estimated-
 * cost notice, the summary cards, the chart and the table. A failed load shows
 * the error with «Повторить» — never zeros (load-state rule).
 */
export function ReportScreen<Row extends { id: string }>({
	title,
	periodLabel,
	view,
	filters,
	exportName,
	onPrint,
	onRetry,
	errorTitle,
}: Readonly<ReportScreenProps<Row>>) {
	const { t } = useTranslation();
	const tableOrder = useTableOrder<Row>();
	const ready = isReady(view) ? view : null;
	const columns = useMemo(() => (ready ? toTableColumns(ready.columns) : []), [ready]);
	const totalRow = useMemo(
		() => (ready ? toTableTotalsRow(ready.columns, ready.totals, t) : undefined),
		[ready, t],
	);

	const handleExport = () => {
		if (!ready) {
			return;
		}
		const csv = toCsv(ready.columns, tableOrder.apply(ready.rows), ready.totals, t("report.total"));
		exportToCsv(exportName, csv.columns, csv.lines);
	};

	return (
		<>
			<DetailPageHeader
				backTo={PATHS.reports}
				title={title}
				meta={periodLabel ?? undefined}
				primaryAction={
					<>
						<GhostButton icon={<PrintOutlinedIcon />} onClick={onPrint}>
							{t("print.action")}
						</GhostButton>
						<ExportButton onExport={handleExport} rowCount={ready?.rows.length ?? 0} />
					</>
				}
			/>
			<TableToolbar filters={filters} />

			{ready === null ? (
				<LoadStateView
					state={isReady(view) ? "loading" : view}
					onRetry={onRetry}
					errorTitle={errorTitle}
				/>
			) : (
				<>
					{ready.costIsEstimated && (
						<Alert severity="info" sx={{ mb: "16px" }}>
							{t("report.estimatedCost")}
						</Alert>
					)}
					<ReportKpiRow kpis={ready.kpis} />
					{ready.chart && <ReportChart spec={ready.chart} />}
					<DataTable<Row>
						rows={ready.rows}
						columns={columns}
						exportOrder={tableOrder}
						summary={<TableTotals count={ready.countLabel(ready.rows.length)} />}
						totalRow={totalRow}
						empty={
							<TableEmptyState
								icon={<AssessmentOutlinedIcon />}
								title={ready.empty.title}
								hint={ready.empty.hint}
							/>
						}
					/>
				</>
			)}
		</>
	);
}

export default ReportScreen;
