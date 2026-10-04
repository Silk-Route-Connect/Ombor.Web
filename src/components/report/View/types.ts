import React from "react";
import { MoneyTone } from "components/shared/Table/cells/MoneyCell";
import { Measurement } from "models/product";

/**
 * One report as the screen, the CSV and the print view all read it: a pure
 * builder (`build<Kind>View`) maps the served report to this shape, so the
 * three outputs can never disagree on a column, a label or a total.
 */

export type ReportCellKind = "text" | "money" | "count" | "quantity" | "percent";

export interface ReportColumn<Row> {
	key: string;
	header: string;
	/** One plain sentence behind the header's «i» (no formula). */
	hint?: string;
	kind: ReportCellKind;
	/** The raw figure or text — what the CSV writes and (without `sort`) the table sorts by. */
	value: (row: Row) => string | number | null;
	/** Sort key when the shown text does not sort (a «04.10.2026» day sorts by its ISO key). */
	sort?: (row: Row) => string | number | null;
	/** Screen cell when the kind's default is not enough (links, pills). */
	cell?: (row: Row) => React.ReactNode;
	/** The table's headline amount (one per report). */
	main?: boolean;
	/** Money that can go below zero (a loss): «−…» in red, never a bare «−» on a 0. */
	signed?: boolean;
	/** Direction money (cash in / out) only. */
	tone?: MoneyTone;
	/** Unit of a quantity column. */
	measurement?: (row: Row) => Measurement | undefined;
}

export interface ReportKpi {
	key: string;
	caption: string;
	hint?: string;
	value: number;
	format: "money" | "count";
	/** Direction money (cash in / out). */
	tone?: MoneyTone;
	/** Profit that can be a loss: «−…» in red. */
	signed?: boolean;
	/** One muted line under the figure. */
	sub?: string;
}

/** Palette family of a chart series — resolved against the theme at render time. */
export type ReportChartColor = "primary" | "secondary" | "success" | "error" | "info" | "warning";

export interface ReportChartSeries {
	key: string;
	label: string;
	color: ReportChartColor;
}

export interface ReportChartPoint {
	key: string;
	/** Axis tick («04.10») or the entity name. */
	tick: string;
	/** Tooltip heading («04.10.2026», «28.09 – 04.10.2026», the full name). */
	heading: string;
	values: Record<string, number>;
}

export interface ReportChartSpec {
	title: string;
	subtitle?: string;
	/** `time` — a bar per bucket, oldest first; `ranking` — the largest rows as horizontal bars. */
	layout: "time" | "ranking";
	series: ReportChartSeries[];
	points: ReportChartPoint[];
}

export interface ReportView<Row extends { id: string }> {
	kpis: ReportKpi[];
	chart: ReportChartSpec | null;
	columns: ReportColumn<Row>[];
	rows: Row[];
	/** «Итого» per column key — the CSV's last row, the print view's summary row. */
	totals: Partial<Record<string, number>>;
	/** The row count in words («31 день», «12 товаров»). */
	countLabel: (count: number) => string;
	/** Any cost behind the figures is an estimate (sales recorded before 2026-10-04). */
	costIsEstimated: boolean;
	/** Lines under the print title besides the period («Группировка: по товарам»). */
	details: string[];
	empty: { title: string; hint: string };
}
