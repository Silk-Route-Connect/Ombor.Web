import { TFunction } from "i18next";
import { isTimeGroupBy, SalesReport, SalesReportRow } from "models/report";
import { formatCurrency, formatPercent } from "utils/formatCurrency";

import { ReportColumn, ReportView } from "../View/types";
import { groupColumn, groupCount, groupDetail, groupPoints } from "./groupedReport";

export type SalesViewRow = SalesReportRow & { id: string };

/**
 * «Продажи»: what was sold, what came back, what the goods cost and the gross
 * profit left on them — by day / week / month or by product, category, client
 * or warehouse. Every figure is the served one (reports.md → sales).
 */
export function buildSalesView(report: SalesReport, t: TFunction): ReportView<SalesViewRow> {
	const { groupBy, totals } = report;
	const rows = report.rows.map((row) => ({ ...row, id: row.key }));

	const columns: ReportColumn<SalesViewRow>[] = [
		groupColumn<SalesViewRow>(groupBy, "sale", t),
		{
			key: "documents",
			header: t("report.sales.col.documents"),
			kind: "count",
			value: (r) => r.documents,
		},
		...(groupBy === "Product"
			? [
					{
						key: "quantity",
						header: t("report.col.quantity"),
						kind: "quantity",
						value: (r: SalesViewRow) => r.quantity,
					} satisfies ReportColumn<SalesViewRow>,
				]
			: []),
		{
			key: "revenue",
			header: t("report.sales.col.revenue"),
			kind: "money",
			value: (r) => r.revenue,
		},
		{
			key: "refunds",
			header: t("report.sales.col.refunds"),
			kind: "money",
			value: (r) => r.refunds,
		},
		{
			key: "netRevenue",
			header: t("report.term.netRevenue"),
			hint: t("report.hint.netRevenue"),
			kind: "money",
			value: (r) => r.netRevenue,
		},
		{
			key: "cost",
			header: t("report.term.cost"),
			hint: t("report.hint.cost"),
			kind: "money",
			value: (r) => r.cost,
		},
		{
			key: "grossProfit",
			header: t("report.term.grossProfit"),
			hint: t("report.hint.grossProfit"),
			kind: "money",
			main: true,
			signed: true,
			value: (r) => r.grossProfit,
		},
		{
			key: "margin",
			header: t("report.term.margin"),
			hint: t("report.hint.margin"),
			kind: "percent",
			value: (r) => r.marginPercent ?? null,
		},
	];

	return {
		kpis: [
			{
				key: "netRevenue",
				caption: t("report.term.netRevenue"),
				hint: t("report.hint.netRevenue"),
				value: totals.netRevenue,
				format: "money",
				sub: t("report.sales.kpi.revenueSub", {
					sales: formatCurrency(totals.revenue),
					refunds: formatCurrency(totals.refunds),
				}),
			},
			{
				key: "cost",
				caption: t("report.term.cost"),
				hint: t("report.hint.cost"),
				value: totals.cost,
				format: "money",
			},
			{
				key: "grossProfit",
				caption: t("report.term.grossProfit"),
				hint: t("report.hint.grossProfit"),
				value: totals.grossProfit,
				format: "money",
				signed: true,
				sub:
					totals.marginPercent != null
						? t("report.sales.kpi.marginSub", { value: formatPercent(totals.marginPercent) })
						: undefined,
			},
			{
				key: "documents",
				caption: t("report.sales.kpi.documents"),
				value: totals.documents,
				format: "count",
				sub: t("report.sales.kpi.refundDocuments", { count: totals.refundDocuments }),
			},
		],
		chart: {
			title: t("report.sales.chart"),
			layout: isTimeGroupBy(groupBy) ? "time" : "ranking",
			series: [
				{ key: "netRevenue", label: t("report.term.netRevenue"), color: "primary" },
				{ key: "grossProfit", label: t("report.term.grossProfit"), color: "secondary" },
			],
			points: groupPoints(
				groupBy,
				rows,
				(r) => ({ netRevenue: r.netRevenue, grossProfit: r.grossProfit }),
				t,
			),
		},
		columns,
		rows,
		totals: {
			documents: totals.documents,
			quantity: totals.quantity,
			revenue: totals.revenue,
			refunds: totals.refunds,
			netRevenue: totals.netRevenue,
			cost: totals.cost,
			grossProfit: totals.grossProfit,
			margin: totals.marginPercent ?? undefined,
		},
		countLabel: groupCount(groupBy, t),
		costIsEstimated: report.costIsEstimated,
		details: [groupDetail(groupBy, t)],
		empty: { title: t("report.empty.title"), hint: t("report.sales.empty") },
	};
}
