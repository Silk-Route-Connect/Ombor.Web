import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useSearchParams } from "react-router-dom";
import ReportByKind from "components/report/kinds/ReportByKind";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { parseReportQuery, reportKindFromSlug } from "utils/report/reportQuery";

/**
 * A report's print view (`/reports/:kind/print?period=…&groupBy=…`). The filters
 * live in the URL, so a reload or a shared link prints the same report; they are
 * applied before the report opens (a child's effect runs before this page's).
 */
const ReportPrintPage: React.FC = () => {
	const { t } = useTranslation();
	const { kind: slug } = useParams();
	const [searchParams] = useSearchParams();
	const { reportStore } = useStore();
	const kind = reportKindFromSlug(slug);
	const [applied, setApplied] = useState(false);

	useEffect(() => {
		if (kind !== null) {
			reportStore.applyQuery(kind, parseReportQuery(searchParams));
		}
		setApplied(true);
		return () => reportStore.close();
	}, [kind, searchParams, reportStore]);

	if (kind === null) {
		return (
			<LoadStateView
				state={null}
				notFound={{
					title: t("report.notFound"),
					backTo: PATHS.reports,
					backLabel: t("report.toHub"),
				}}
			/>
		);
	}
	return applied ? <ReportByKind kind={kind} mode="print" /> : <LoadStateView state="loading" />;
};

export default ReportPrintPage;
