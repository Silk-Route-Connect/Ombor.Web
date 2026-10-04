import React from "react";
import { formatPercent } from "utils/formatCurrency";

export type DashboardKpiKey =
	| "revenue"
	| "cash"
	| "stockValue"
	| "receivable"
	| "payable"
	| "overdue";

/** good / bad colour the change by what it means for the owner; warn is the aging axis. */
export type DeltaTone = "good" | "bad" | "neutral" | "warn";

export type Delta = {
	text: string;
	tone: DeltaTone;
	direction: "up" | "down" | "flat";
};

export type KpiCardSpec = {
	key: DashboardKpiKey;
	icon: React.ReactNode;
	caption: string;
	/** Money amount — counted up on mount / period change. */
	value: number;
	valueColor: string;
	/** Palette family of the sparkline stroke. */
	spark: "primary" | "success" | "warning" | "error" | "info";
	/** Served per-bucket points; fewer than two draws no line. */
	trend: number[];
	delta?: Delta;
	footnote: string;
	/** A second meta line (revenue: the refunds already netted out). */
	detail?: string;
	/** Hover / focus breakdown (cash: per wallet). */
	tooltip?: React.ReactNode;
};

/**
 * A served % change as a badge: the arrow follows the sign, the colour what the
 * change means — `goodWhen: "up"` for revenue and cash, `"down"` for what we owe,
 * `"neutral"` where neither direction is good news by itself.
 */
export function deltaOf(pct: number | null, goodWhen: "up" | "down" | "neutral"): Delta {
	if (pct === null) {
		return { text: "—", tone: "neutral", direction: "flat" };
	}
	const direction = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
	const sign = pct > 0 ? "+" : pct < 0 ? "−" : "";
	const text = `${sign}${formatPercent(Math.abs(pct))}%`;
	if (direction === "flat" || goodWhen === "neutral") {
		return { text, tone: "neutral", direction };
	}
	return { text, tone: direction === goodWhen ? "good" : "bad", direction };
}
