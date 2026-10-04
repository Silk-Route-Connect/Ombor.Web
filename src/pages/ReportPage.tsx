import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ReportByKind from "components/report/kinds/ReportByKind";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { reportKindFromSlug } from "utils/report/reportQuery";

/** One report of «Отчёты» (`/reports/:kind`); an unknown name reads «Отчёт не найден». */
const ReportPage: React.FC = () => {
	const { t } = useTranslation();
	const { kind: slug } = useParams();
	const { reportStore } = useStore();
	const kind = reportKindFromSlug(slug);

	useEffect(() => () => reportStore.close(), [reportStore]);

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
	return <ReportByKind key={kind} kind={kind} mode="screen" />;
};

export default ReportPage;
