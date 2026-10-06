import React from "react";
import ProductLink from "components/product/Links/ProductLink";
import SkuCell from "components/shared/Table/cells/SkuCell";
import { TFunction } from "i18next";
import { LossesReport } from "models/report";

import { ReportView } from "../View/types";

export type LossesViewRow = LossesReport["products"][number] & { id: string };

/**
 * «Списания»: stock written off in the period (damage, expiry, theft, recount),
 * each valued at the average cost it left at — the loss kept apart from the
 * cost of sold goods (reports.md → losses).
 */
export function buildLossesView(report: LossesReport, t: TFunction): ReportView<LossesViewRow> {
	const top = report.reasons[0];

	return {
		kpis: [
			{
				key: "value",
				caption: t("report.losses.kpi.value"),
				hint: t("report.hint.losses"),
				value: report.value,
				format: "money",
			},
			{
				key: "count",
				caption: t("report.losses.kpi.count"),
				value: report.count,
				format: "count",
			},
			{
				key: "products",
				caption: t("report.losses.kpi.products"),
				value: report.products.length,
				format: "count",
			},
			...(top
				? [
						{
							key: "topReason",
							caption: t("report.losses.kpi.topReason", {
								reason: t(`adjustment.reason.${top.reason}`),
							}),
							value: top.value,
							format: "money" as const,
							sub: t("report.losses.kpi.topReasonSub", { count: top.count }),
						},
					]
				: []),
		],
		chart: {
			title: t("report.losses.chart"),
			layout: "ranking",
			series: [{ key: "value", label: t("report.losses.kpi.value"), color: "warning" }],
			points: report.reasons.map((r) => {
				const label = t(`adjustment.reason.${r.reason}`);
				return {
					key: r.reason,
					tick: label,
					heading: `${label} · ${t("report.losses.kpi.topReasonSub", { count: r.count })}`,
					values: { value: r.value },
				};
			}),
		},
		columns: [
			{
				key: "product",
				header: t("report.col.product"),
				kind: "text",
				value: (r) => r.productName,
				cell: (r) => <ProductLink id={r.productId} name={r.productName} />,
			},
			{
				key: "sku",
				header: t("report.col.sku"),
				kind: "text",
				value: (r) => r.sku,
				cell: (r) => <SkuCell sku={r.sku} />,
			},
			{ key: "count", header: t("report.losses.col.count"), kind: "count", value: (r) => r.count },
			{
				key: "quantity",
				header: t("report.col.quantity"),
				kind: "quantity",
				value: (r) => r.quantity,
				measurement: (r) => r.measurement,
			},
			{
				key: "value",
				header: t("report.losses.col.value"),
				hint: t("report.hint.losses"),
				kind: "money",
				main: true,
				value: (r) => r.value,
			},
		],
		rows: report.products.map((p) => ({ ...p, id: String(p.productId) })),
		totals: { count: report.count, value: report.value },
		countLabel: (count) => t("report.count.Product", { count }),
		costIsEstimated: false,
		details: [],
		empty: { title: t("report.empty.title"), hint: t("report.losses.empty") },
	};
}
