import React from "react";
import { TFunction } from "i18next";
import { DashboardData } from "models/dashboard";
import { formatCurrency, formatPercent } from "utils/formatCurrency";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";

import CashBreakdown from "./CashBreakdown";
import { deltaOf, KpiCardSpec } from "./types";

/**
 * The seven «Главное» cards in reading order — what came in, what it earned and
 * what we hold (Выручка · Валовая прибыль · Деньги в кассах · Стоимость товара),
 * then who owes whom (Нам должны · Мы должны · Долги старше 30 дней). Every
 * figure, change and trend is served (hard rule 8); receivable / payable are the
 * same net partner positions as Partners and «Долги». Aggregates carry colour +
 * label, no sign (pattern 4) — only gross profit reads «−…» when goods went out
 * below their cost.
 */
export function buildKpiCardSpecs(data: DashboardData, t: TFunction): KpiCardSpec[] {
	const refunds = data.saleRefunds.value;
	const profit = data.grossProfit;
	return [
		{
			key: "revenue",
			icon: <LocalAtmOutlinedIcon />,
			caption: t("dashboard.kpi.revenue"),
			value: data.revenue.value,
			valueColor: "text.primary",
			spark: "primary",
			trend: data.revenue.trend,
			delta: deltaOf(data.revenue.deltaPct, "up"),
			footnote: t("dashboard.kpi.vsPrevPeriod"),
			detail:
				refunds > 0
					? t("dashboard.kpi.refundsNetted", { amount: formatCurrency(refunds) })
					: t("dashboard.kpi.noRefunds"),
		},
		{
			key: "grossProfit",
			icon: <SavingsOutlinedIcon />,
			caption: t("dashboard.kpi.grossProfit"),
			value: profit.value,
			valueColor: profit.value < 0 ? "error.main" : "text.primary",
			signed: true,
			spark: "secondary",
			trend: profit.trend,
			delta: deltaOf(profit.deltaPct, "up"),
			footnote: t("dashboard.kpi.vsPrevPeriod"),
			detail: [
				profit.marginPercent != null
					? t("dashboard.kpi.marginShare", { value: formatPercent(profit.marginPercent) })
					: null,
				profit.costIsEstimated ? t("dashboard.kpi.costEstimated") : null,
			]
				.filter(Boolean)
				.join(" · "),
			hint: true,
			tooltip: t("dashboard.kpi.grossProfitHint"),
		},
		{
			key: "cash",
			icon: <AccountBalanceWalletOutlinedIcon />,
			caption: t("dashboard.kpi.cash"),
			value: data.cash.value,
			valueColor: "text.primary",
			spark: "info",
			trend: data.cash.trend,
			delta: deltaOf(data.cash.deltaPct, "up"),
			footnote: t("dashboard.kpi.wallets", { count: data.cash.wallets.length }),
			tooltip: <CashBreakdown wallets={data.cash.wallets} />,
		},
		{
			key: "stockValue",
			icon: <Inventory2OutlinedIcon />,
			caption: t("dashboard.kpi.stockValue"),
			value: data.stockValue.value,
			valueColor: "text.primary",
			spark: "primary",
			trend: [],
			footnote: t("dashboard.kpi.stockProducts", {
				count: data.stockValue.productCount,
				warehouses: t("dashboard.kpi.stockWarehouses", {
					count: data.stockValue.warehouseCount,
				}),
			}),
			detail: t("dashboard.kpi.stockValueBasis"),
		},
		{
			key: "receivable",
			icon: <ArrowDownwardIcon />,
			caption: t("dashboard.kpi.receivable"),
			value: data.receivable.value,
			valueColor: "success.main",
			spark: "success",
			trend: data.receivable.trend,
			delta: deltaOf(data.receivable.deltaPct, "neutral"),
			footnote: t("partner.summary.receivableSub", { count: data.receivable.count }),
		},
		{
			key: "payable",
			icon: <ArrowUpwardIcon />,
			caption: t("dashboard.kpi.payable"),
			value: data.payable.value,
			valueColor: "error.main",
			spark: "error",
			trend: data.payable.trend,
			delta: deltaOf(data.payable.deltaPct, "down"),
			footnote: t("partner.summary.payableSub", { count: data.payable.count }),
		},
		{
			key: "overdue",
			icon: <ReportProblemOutlinedIcon />,
			caption: t("dashboard.kpi.overdue"),
			value: data.overdue.value,
			// Age-based («older than 30 days») — the aging axis keeps amber; red is
			// reserved for past-due «Просрочено» (ui-patterns → Chip colour semantics).
			valueColor: "warning.main",
			spark: "warning",
			trend: data.overdue.trend,
			delta: {
				text: t("debt.summary.txCount", { count: data.overdue.count }),
				tone: "warn",
				direction: "flat",
			},
			footnote: t("dashboard.kpi.partners", { count: data.overdue.partnerCount }),
		},
	];
}
