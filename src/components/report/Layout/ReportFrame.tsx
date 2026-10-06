import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Loadable } from "helpers/Loading";
import { reportPath, reportPrintPath } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { csvDateStamp } from "utils/exportToCsv";
import { REPORT_SLUGS, ReportKind } from "utils/report/reportQuery";

import ReportPrint from "../Print/ReportPrint";
import { ReportView } from "../View/types";
import ReportScreen from "./ReportScreen";

/** A report renders as its screen (`/reports/:kind`) or as its print view (`…/print`). */
export type ReportMode = "screen" | "print";

interface ReportFrameProps<Row extends { id: string }> {
	kind: ReportKind;
	mode: ReportMode;
	view: Loadable<ReportView<Row>>;
	periodLabel: string | null;
	/** The screen's filter row (period, grouping, warehouse…); not printed. */
	filters: React.ReactNode;
	onRetry: () => void;
}

/** Hands one report's view to the screen or to the paper layout. */
export function ReportFrame<Row extends { id: string }>({
	kind,
	mode,
	view,
	periodLabel,
	filters,
	onRetry,
}: Readonly<ReportFrameProps<Row>>) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { reportStore } = useStore();
	const title = t(`report.kind.${kind}.title`);
	const errorTitle = t(`report.error.load.${kind}`);

	if (mode === "print") {
		return (
			<ReportPrint
				title={title}
				periodLabel={periodLabel}
				view={view}
				backTo={reportPath(kind)}
				onRetry={onRetry}
				errorTitle={errorTitle}
			/>
		);
	}

	return (
		<ReportScreen
			title={title}
			periodLabel={periodLabel}
			view={view}
			filters={filters}
			exportName={`report-${REPORT_SLUGS[kind]}_${csvDateStamp()}`}
			onPrint={() => navigate(reportPrintPath(kind, reportStore.queryOf(kind)))}
			onRetry={onRetry}
			errorTitle={errorTitle}
		/>
	);
}

export default ReportFrame;
