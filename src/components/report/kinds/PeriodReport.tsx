import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import DateRangeFilter from "components/shared/Date/DateRangeFilter";
import { isReady, mapLoadable } from "helpers/Loading";
import { TFunction } from "i18next";
import { observer } from "mobx-react-lite";
import { ReportPeriod } from "models/report";
import { ReportResource } from "stores/ReportResource";
import { useStore } from "stores/StoreContext";
import { formatCustomRange } from "utils/dateRange";
import { isGroupedReport, REPORT_GROUPINGS, ReportKind } from "utils/report/reportQuery";

import ReportGroupBySelect from "../Filters/ReportGroupBySelect";
import ReportFrame, { ReportMode } from "../Layout/ReportFrame";
import { ReportView } from "../View/types";

interface PeriodReportProps<Data extends ReportPeriod, Row extends { id: string }> {
	kind: ReportKind;
	mode: ReportMode;
	resource: ReportResource<Data>;
	build: (data: Data, t: TFunction) => ReportView<Row>;
}

/**
 * A report over a period (every report but stock): opens it, filters it by the
 * shared period («Этот месяц» by default, never «Весь период») and, where the
 * API groups it, by «Группировка»; the served period heads the page.
 */
function PeriodReportView<Data extends ReportPeriod, Row extends { id: string }>({
	kind,
	mode,
	resource,
	build,
}: Readonly<PeriodReportProps<Data, Row>>) {
	const { t } = useTranslation();
	const { reportStore } = useStore();

	useEffect(() => {
		void reportStore.open(kind);
	}, [reportStore, kind]);

	const data = resource.data;
	const view = useMemo(() => mapLoadable(data, (report) => build(report, t)), [data, build, t]);
	const periodLabel = isReady(data) ? formatCustomRange(data.from, data.to) : null;

	const filters = (
		<>
			<DateRangeFilter
				value={reportStore.dateRange}
				onChange={reportStore.setDateRange}
				withAllTime={false}
			/>
			{isGroupedReport(kind) && (
				<ReportGroupBySelect
					value={reportStore.groupBy[kind]}
					options={REPORT_GROUPINGS[kind]}
					onChange={(value) => reportStore.setGroupBy(kind, value)}
				/>
			)}
		</>
	);

	return (
		<ReportFrame
			kind={kind}
			mode={mode}
			view={view}
			periodLabel={periodLabel}
			filters={filters}
			onRetry={() => void reportStore.reload()}
		/>
	);
}

export const PeriodReport = observer(PeriodReportView) as typeof PeriodReportView;

export default PeriodReport;
