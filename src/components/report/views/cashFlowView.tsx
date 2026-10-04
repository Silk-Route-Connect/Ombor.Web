import React from "react";
import EntityCell from "components/shared/Table/cells/EntityCell";
import WalletLink from "components/wallet/Links/WalletLink";
import { TFunction } from "i18next";
import { CashFlowFigures, CashFlowReport, CashFlowWallet } from "models/report";
import { formatCurrency } from "utils/formatCurrency";
import { bucketLabel, bucketTick } from "utils/report/reportLabels";

import { ReportColumn, ReportView } from "../View/types";

export type CashFlowViewRow = CashFlowWallet & { id: string };

/**
 * «Деньги по кассам»: per wallet, what it held when the period began, what came
 * in and went out, transfers between wallets, and what it holds at the end
 * (reports.md → cash flow). The transfer and opening-balance columns show only
 * when the period has any, so a shop with one cash box reads four plain columns.
 */
export function buildCashFlowView(
	report: CashFlowReport,
	t: TFunction,
): ReportView<CashFlowViewRow> {
	const { totals } = report;
	const hasInitial = totals.initialBalance !== 0;
	const hasTransfers = totals.transfersIn !== 0 || totals.transfersOut !== 0;

	const money = (
		key: keyof CashFlowFigures,
		header: string,
		extra: Partial<ReportColumn<CashFlowViewRow>> = {},
	): ReportColumn<CashFlowViewRow> => ({
		key,
		header,
		kind: "money",
		value: (r) => r[key],
		...extra,
	});

	const columns: ReportColumn<CashFlowViewRow>[] = [
		{
			key: "wallet",
			header: t("report.cashFlow.col.wallet"),
			kind: "text",
			value: (r) => r.name,
			cell: (r) => (
				<EntityCell archived={r.isArchived} secondary={t(`wallet.type.${r.type.toLowerCase()}`)}>
					<WalletLink id={r.walletId} name={r.name} archived={r.isArchived} />
				</EntityCell>
			),
		},
		money("opening", t("report.cashFlow.col.opening")),
		...(hasInitial
			? [
					money("initialBalance", t("report.cashFlow.col.initialBalance"), {
						hint: t("report.hint.initialBalance"),
					}),
				]
			: []),
		money("income", t("report.cashFlow.col.income"), { tone: "income" }),
		money("expense", t("report.cashFlow.col.expense"), { tone: "expense" }),
		...(hasTransfers
			? [
					money("transfersIn", t("report.cashFlow.col.transfersIn")),
					money("transfersOut", t("report.cashFlow.col.transfersOut")),
				]
			: []),
		money("closing", t("report.cashFlow.col.closing"), { main: true }),
	];

	return {
		kpis: [
			{
				key: "opening",
				caption: t("report.cashFlow.col.opening"),
				value: totals.opening,
				format: "money",
				sub: hasInitial
					? t("report.cashFlow.kpi.initialSub", { amount: formatCurrency(totals.initialBalance) })
					: undefined,
			},
			{
				key: "income",
				caption: t("report.cashFlow.col.income"),
				value: totals.income,
				format: "money",
				tone: "income",
			},
			{
				key: "expense",
				caption: t("report.cashFlow.col.expense"),
				value: totals.expense,
				format: "money",
				tone: "expense",
			},
			{
				key: "closing",
				caption: t("report.cashFlow.col.closing"),
				value: totals.closing,
				format: "money",
			},
		],
		chart: {
			title: t("report.cashFlow.chart"),
			layout: "time",
			series: [
				{ key: "income", label: t("report.cashFlow.col.income"), color: "success" },
				{ key: "expense", label: t("report.cashFlow.col.expense"), color: "error" },
			],
			points: report.series.map((day) => ({
				key: day.date,
				tick: bucketTick("Day", day.date),
				heading: bucketLabel("Day", day.date, t),
				values: { income: day.income, expense: day.expense },
			})),
		},
		columns,
		rows: report.wallets.map((wallet) => ({ ...wallet, id: String(wallet.walletId) })),
		totals: { ...totals },
		countLabel: (count) => t("report.count.wallet", { count }),
		costIsEstimated: false,
		details: [],
		empty: { title: t("report.empty.title"), hint: t("report.cashFlow.empty") },
	};
}
