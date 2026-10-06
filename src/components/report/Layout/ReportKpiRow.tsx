import React from "react";
import StatCard from "components/shared/StatCard/StatCard";
import StatCardGrid from "components/shared/StatCard/StatCardGrid";
import { formatCurrencyMinus, formatQuantity } from "utils/formatCurrency";

import { ReportKpi } from "../View/types";

const TONE_COLOR = {
	ink: "text.primary",
	income: "success.main",
	expense: "error.main",
} as const;

function kpiColor(kpi: ReportKpi): string {
	if (kpi.signed && kpi.value < 0) {
		return TONE_COLOR.expense;
	}
	return TONE_COLOR[kpi.tone ?? "ink"];
}

function kpiText(kpi: ReportKpi): string {
	if (kpi.format === "count") {
		return formatQuantity(kpi.value);
	}
	return formatCurrencyMinus(kpi.value);
}

/**
 * The report's summary figures for the whole period, served totals only — one
 * `StatCard` each: caption (with its «i» where the term needs one), the figure,
 * and a muted line that names what it is made of.
 */
const ReportKpiRow: React.FC<{ kpis: ReportKpi[] }> = ({ kpis }) => (
	<StatCardGrid columns={kpis.length} sx={{ mb: 2 }}>
		{kpis.map((kpi) => (
			<StatCard
				key={kpi.key}
				caption={kpi.caption}
				hint={kpi.hint}
				value={kpiText(kpi)}
				valueColor={kpiColor(kpi)}
				unit={kpi.format === "money" ? "uzs" : undefined}
				footer={kpi.sub}
			/>
		))}
	</StatCardGrid>
);

export default ReportKpiRow;
