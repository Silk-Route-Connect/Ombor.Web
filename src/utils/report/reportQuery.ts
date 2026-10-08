import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
import { REPORT_GROUP_BY, ReportGroupBy, TIME_GROUP_BY } from "models/report";
import {
	customDateRange,
	DATE_PRESETS,
	DatePreset,
	DateRangeValue,
	toDayParams,
} from "utils/dateRange";
import { STOCK_FILTERS, StockFilter } from "utils/stockLevel";

/** The reports of the «Отчёты» section, in hub order («Долги» is its own page). */
export const REPORT_KINDS = [
	"sales",
	"profit",
	"purchases",
	"stock",
	"cashFlow",
	"expenses",
	"losses",
] as const;
export type ReportKind = (typeof REPORT_KINDS)[number];

/** URL segment of each report (`/reports/cash-flow`). */
export const REPORT_SLUGS: Record<ReportKind, string> = {
	sales: "sales",
	profit: "profit",
	purchases: "purchases",
	stock: "stock",
	cashFlow: "cash-flow",
	expenses: "expenses",
	losses: "losses",
};

export function reportKindFromSlug(slug: string | undefined): ReportKind | null {
	return REPORT_KINDS.find((kind) => REPORT_SLUGS[kind] === slug) ?? null;
}

/** The reports with a «Группировка» selector and the groupings the API takes for each. */
export const REPORT_GROUPINGS = {
	sales: REPORT_GROUP_BY,
	purchases: REPORT_GROUP_BY,
	profit: TIME_GROUP_BY,
} as const satisfies Partial<Record<ReportKind, readonly ReportGroupBy[]>>;
export type GroupedReportKind = keyof typeof REPORT_GROUPINGS;

export const isGroupedReport = (kind: ReportKind): kind is GroupedReportKind =>
	kind in REPORT_GROUPINGS;

/** The stock report is today's stock — no period, a warehouse filter instead. */
export const isDatedReport = (kind: ReportKind): boolean => kind !== "stock";

/** The API refuses a longer period (3 × 366 days). */
export const MAX_REPORT_DAYS = 1098;

/** Calendar days a period covers (both ends included); null for «Весь период». */
export function periodDays(value: DateRangeValue, now: Date = new Date()): number | null {
	const { from, to } = toDayParams(value, now);
	return from && to ? differenceInCalendarDays(parseISO(to), parseISO(from)) + 1 : null;
}

/** What a report's print view needs to reproduce the screen: period, grouping, stock filters. */
export interface ReportQuery {
	period: DateRangeValue;
	groupBy?: ReportGroupBy;
	warehouseId?: number | null;
	search?: string;
	level?: StockFilter;
}

/** The query as URL parameters — a preset by name (`period=month`), a custom range by its days. */
export function reportQueryParams(query: ReportQuery): Record<string, string> {
	const params: Record<string, string> = {};
	if (query.period.preset === "custom") {
		params.from = query.period.from;
		params.to = query.period.to;
	} else {
		params.period = query.period.preset;
	}
	if (query.groupBy) {
		params.groupBy = query.groupBy;
	}
	if (query.warehouseId != null) {
		params.warehouseId = String(query.warehouseId);
	}
	if (query.search?.trim()) {
		params.q = query.search.trim();
	}
	if (query.level && query.level !== "all") {
		params.level = query.level;
	}
	return params;
}

/** Reads a print view's URL back; anything missing or malformed is left to the screen's choice. */
export function parseReportQuery(params: URLSearchParams): Partial<ReportQuery> {
	const query: Partial<ReportQuery> = {};
	const preset = params.get("period");
	const from = params.get("from");
	const to = params.get("to");
	if (preset && (DATE_PRESETS as readonly string[]).includes(preset) && preset !== "all") {
		query.period = { preset: preset as DatePreset };
	} else if (from && to && isValid(parseISO(from)) && isValid(parseISO(to))) {
		query.period = customDateRange(from, to);
	}
	const groupBy = params.get("groupBy");
	if (groupBy && (REPORT_GROUP_BY as readonly string[]).includes(groupBy)) {
		query.groupBy = groupBy as ReportGroupBy;
	}
	const warehouseId = Number(params.get("warehouseId"));
	if (Number.isInteger(warehouseId) && warehouseId > 0) {
		query.warehouseId = warehouseId;
	}
	query.search = params.get("q") ?? "";
	const level = params.get("level");
	query.level = STOCK_FILTERS.find((value) => value === level) ?? "all";
	return query;
}
