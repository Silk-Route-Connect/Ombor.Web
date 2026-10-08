import React from "react";
import ProductLink from "components/product/Links/ProductLink";
import EntityCell from "components/shared/Table/cells/EntityCell";
import SkuCell from "components/shared/Table/cells/SkuCell";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import StockQuantityCell from "components/warehouse/Stock/StockQuantityCell";
import { TFunction } from "i18next";
import { StockReport, StockReportRow } from "models/report";
import { StockFilter, stockRowLevel } from "utils/stockLevel";

import { ReportView } from "../View/types";

export type StockViewRow = StockReportRow & { id: string };

/** The screen's stock filters, named on paper so a narrowed «Итого» reads right. */
export interface StockViewFilters {
	warehouseLabel: string;
	search: string;
	level: StockFilter;
}

/**
 * «Остатки и стоимость склада»: today's stock per product per warehouse, valued
 * at the average cost and at today's sale prices (reports.md → stock). `rows`
 * are the served rows narrowed on screen by search and stock level; the cards
 * and the chart keep the served totals of the picked warehouse(s).
 */
export function buildStockView(
	report: StockReport,
	rows: StockReportRow[],
	filters: StockViewFilters,
	t: TFunction,
): ReportView<StockViewRow> {
	const { totals } = report;
	// A search or «Остаток» filter narrows the rows: «Итого» then sums the rows shown
	// (the served totals cover every row of the picked warehouses).
	const narrowed = rows.length !== report.rows.length;
	const sum = (pick: (row: StockReportRow) => number) =>
		rows.reduce((acc, row) => acc + pick(row), 0);

	return {
		kpis: [
			{
				key: "value",
				caption: t("report.stock.kpi.value"),
				hint: t("report.hint.stockValue"),
				value: totals.value,
				format: "money",
			},
			{
				key: "saleValue",
				caption: t("report.stock.col.saleValue"),
				hint: t("report.hint.saleValue"),
				value: totals.saleValue,
				format: "money",
			},
			{
				key: "productCount",
				caption: t("report.stock.kpi.productCount"),
				value: totals.productCount,
				format: "count",
			},
			{
				key: "lowStock",
				caption: t("report.stock.kpi.lowStock"),
				hint: t("report.hint.lowStock"),
				value: totals.lowStockCount,
				format: "count",
			},
		],
		chart: {
			title: t("report.stock.chart"),
			layout: "ranking",
			series: [
				{ key: "value", label: t("report.stock.kpi.value"), color: "primary" },
				{ key: "saleValue", label: t("report.stock.col.saleValue"), color: "secondary" },
			],
			points: report.warehouses.map((w) => ({
				key: String(w.warehouseId),
				tick: w.name,
				heading: w.name,
				values: { value: w.value, saleValue: w.saleValue },
			})),
		},
		columns: [
			{
				key: "product",
				header: t("report.col.product"),
				kind: "text",
				value: (r) => r.productName,
				cell: (r) => (
					<EntityCell archived={r.productIsArchived}>
						<ProductLink id={r.productId} name={r.productName} archived={r.productIsArchived} />
					</EntityCell>
				),
			},
			{
				key: "sku",
				header: t("report.col.sku"),
				kind: "text",
				value: (r) => r.sku,
				cell: (r) => <SkuCell sku={r.sku} />,
			},
			{
				key: "warehouse",
				header: t("report.group.Warehouse"),
				kind: "text",
				value: (r) => r.warehouseName,
				cell: (r) => (
					<EntityCell archived={r.warehouseIsArchived}>
						<WarehouseLink
							id={r.warehouseId}
							name={r.warehouseName}
							archived={r.warehouseIsArchived}
						/>
					</EntityCell>
				),
			},
			{
				key: "quantity",
				header: t("report.stock.col.quantity"),
				kind: "quantity",
				value: (r) => r.quantity,
				measurement: (r) => r.measurement,
				cell: (r) => (
					<StockQuantityCell
						quantity={r.quantity}
						measurement={r.measurement}
						level={stockRowLevel(r)}
					/>
				),
			},
			{
				key: "averageCost",
				header: t("report.stock.col.averageCost"),
				hint: t("common.hint.wac"),
				kind: "money",
				value: (r) => r.averageCost,
			},
			{
				key: "value",
				header: t("report.stock.col.value"),
				kind: "money",
				main: true,
				value: (r) => r.value,
			},
			{
				key: "saleValue",
				header: t("report.stock.col.saleValue"),
				hint: t("report.hint.saleValue"),
				kind: "money",
				value: (r) => r.saleValue,
			},
		],
		rows: rows.map((row) => ({ ...row, id: `${row.warehouseId}-${row.productId}` })),
		totals: narrowed
			? { value: sum((r) => r.value), saleValue: sum((r) => r.saleValue) }
			: { value: totals.value, saleValue: totals.saleValue },
		countLabel: (count) => t("report.count.position", { count }),
		costIsEstimated: false,
		details: stockDetails(filters, t),
		empty: { title: t("report.empty.title"), hint: t("report.stock.empty") },
	};
}

/** Lines under the printed title: the warehouse, then the «Остаток» filter and the search when set. */
function stockDetails({ warehouseLabel, search, level }: StockViewFilters, t: TFunction): string[] {
	const query = search.trim();
	return [
		t("report.stock.print.warehouse", { name: warehouseLabel }),
		...(level === "all"
			? []
			: [t("report.stock.print.level", { level: t(`warehouse.stockFilter.${level}`) })]),
		...(query ? [t("report.stock.print.search", { query })] : []),
	];
}
