import { TFunction } from "i18next";
import { ProfitReport, ProfitReportFigures, ProfitReportRow } from "models/report";
import { formatCurrency } from "utils/formatCurrency";

import { ReportColumn, ReportView } from "../View/types";
import { groupColumn, groupCount, groupDetail, groupPoints } from "./groupedReport";

export type ProfitViewRow = ProfitReportRow & { id: string };

/**
 * «Прибыль»: revenue − cost of the goods = gross profit; − write-offs, payroll
 * and other expenses = net profit (reports.md → profit). Payments to suppliers
 * are not expenses here — the goods' cost is already in «Себестоимость».
 */
export function buildProfitView(report: ProfitReport, t: TFunction): ReportView<ProfitViewRow> {
	const { groupBy, totals } = report;
	const rows = report.rows.map((row) => ({ ...row, id: row.key }));
	const expenses = totals.losses + totals.payroll + totals.otherExpenses;

	const money = (
		key: keyof ProfitReportFigures,
		header: string,
		extra: Partial<ReportColumn<ProfitViewRow>> = {},
	): ReportColumn<ProfitViewRow> => ({
		key,
		header,
		kind: "money",
		value: (r) => r[key],
		...extra,
	});

	const columns: ReportColumn<ProfitViewRow>[] = [
		groupColumn<ProfitViewRow>(groupBy, "sale", t),
		money("netRevenue", t("report.term.netRevenue"), { hint: t("report.hint.netRevenue") }),
		money("cost", t("report.term.cost"), { hint: t("report.hint.cost") }),
		money("grossProfit", t("report.term.grossProfit"), {
			hint: t("report.hint.grossProfit"),
			signed: true,
		}),
		money("losses", t("report.profit.col.losses"), { hint: t("report.hint.losses") }),
		money("payroll", t("report.profit.col.payroll")),
		money("otherExpenses", t("report.profit.col.otherExpenses"), {
			hint: t("report.hint.otherExpenses"),
		}),
		money("profit", t("report.term.netProfit"), {
			hint: t("report.hint.netProfit"),
			main: true,
			signed: true,
		}),
	];

	return {
		kpis: [
			{
				key: "netRevenue",
				caption: t("report.term.netRevenue"),
				hint: t("report.hint.netRevenue"),
				value: totals.netRevenue,
				format: "money",
			},
			{
				key: "grossProfit",
				caption: t("report.term.grossProfit"),
				hint: t("report.hint.grossProfit"),
				value: totals.grossProfit,
				format: "money",
				signed: true,
				sub: t("report.profit.kpi.costSub", { cost: formatCurrency(totals.cost) }),
			},
			{
				key: "expenses",
				caption: t("report.profit.kpi.expenses"),
				hint: t("report.hint.profitExpenses"),
				value: expenses,
				format: "money",
				sub: t("report.profit.kpi.expensesSub", {
					losses: formatCurrency(totals.losses),
					payroll: formatCurrency(totals.payroll),
					other: formatCurrency(totals.otherExpenses),
				}),
			},
			{
				key: "profit",
				caption: t("report.term.netProfit"),
				hint: t("report.hint.netProfit"),
				value: totals.profit,
				format: "money",
				signed: true,
				sub: totals.profit < 0 ? t("report.profit.kpi.loss") : undefined,
			},
		],
		chart: {
			title: t("report.profit.chart"),
			layout: "time",
			series: [
				{ key: "grossProfit", label: t("report.term.grossProfit"), color: "primary" },
				{ key: "profit", label: t("report.term.netProfit"), color: "secondary" },
			],
			points: groupPoints(
				groupBy,
				rows,
				(r) => ({ grossProfit: r.grossProfit, profit: r.profit }),
				t,
			),
		},
		columns,
		rows,
		totals: {
			netRevenue: totals.netRevenue,
			cost: totals.cost,
			grossProfit: totals.grossProfit,
			losses: totals.losses,
			payroll: totals.payroll,
			otherExpenses: totals.otherExpenses,
			profit: totals.profit,
		},
		countLabel: groupCount(groupBy, t),
		costIsEstimated: report.costIsEstimated,
		details: [groupDetail(groupBy, t)],
		empty: { title: t("report.empty.title"), hint: t("report.empty.hint") },
	};
}
