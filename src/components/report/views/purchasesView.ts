import { TFunction } from "i18next";
import { isTimeGroupBy, PurchasesReport, PurchasesReportRow } from "models/report";
import { formatCurrency } from "utils/formatCurrency";

import { ReportColumn, ReportView } from "../View/types";
import { groupColumn, groupCount, groupDetail, groupPoints } from "./groupedReport";

export type PurchasesViewRow = PurchasesReportRow & { id: string };

/**
 * «Закупки»: goods bought in from suppliers, minus what went back to them — by
 * period or by product, category, supplier or warehouse (reports.md → purchases).
 */
export function buildPurchasesView(
	report: PurchasesReport,
	t: TFunction,
): ReportView<PurchasesViewRow> {
	const { groupBy, totals } = report;
	const rows = report.rows.map((row) => ({ ...row, id: row.key }));

	const columns: ReportColumn<PurchasesViewRow>[] = [
		groupColumn<PurchasesViewRow>(groupBy, "supply", t),
		{
			key: "documents",
			header: t("report.purchases.col.documents"),
			kind: "count",
			value: (r) => r.documents,
		},
		...(groupBy === "Product"
			? [
					{
						key: "quantity",
						header: t("report.col.quantity"),
						kind: "quantity",
						value: (r: PurchasesViewRow) => r.quantity,
					} satisfies ReportColumn<PurchasesViewRow>,
				]
			: []),
		{
			key: "purchases",
			header: t("report.purchases.col.purchases"),
			kind: "money",
			value: (r) => r.purchases,
		},
		{
			key: "refunds",
			header: t("report.purchases.col.refunds"),
			kind: "money",
			value: (r) => r.refunds,
		},
		{
			key: "netPurchases",
			header: t("report.purchases.col.netPurchases"),
			hint: t("report.hint.netPurchases"),
			kind: "money",
			main: true,
			value: (r) => r.netPurchases,
		},
	];

	return {
		kpis: [
			{
				key: "netPurchases",
				caption: t("report.purchases.col.netPurchases"),
				hint: t("report.hint.netPurchases"),
				value: totals.netPurchases,
				format: "money",
				sub: t("report.purchases.kpi.netSub", {
					purchases: formatCurrency(totals.purchases),
					refunds: formatCurrency(totals.refunds),
				}),
			},
			{
				key: "documents",
				caption: t("report.purchases.kpi.documents"),
				value: totals.documents,
				format: "count",
			},
			{
				key: "refunds",
				caption: t("report.purchases.col.refunds"),
				value: totals.refunds,
				format: "money",
				sub: t("report.purchases.kpi.refundDocuments", { count: totals.refundDocuments }),
			},
		],
		chart: {
			title: t("report.purchases.chart"),
			layout: isTimeGroupBy(groupBy) ? "time" : "ranking",
			series: [
				{ key: "netPurchases", label: t("report.purchases.col.netPurchases"), color: "secondary" },
			],
			points: groupPoints(groupBy, rows, (r) => ({ netPurchases: r.netPurchases }), t),
		},
		columns,
		rows,
		totals: {
			documents: totals.documents,
			quantity: totals.quantity,
			purchases: totals.purchases,
			refunds: totals.refunds,
			netPurchases: totals.netPurchases,
		},
		countLabel: groupCount(groupBy, t),
		costIsEstimated: false,
		details: [groupDetail(groupBy, t)],
		empty: { title: t("report.empty.title"), hint: t("report.purchases.empty") },
	};
}
