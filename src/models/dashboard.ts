/**
 * Time-series primitives consumed by the shared `TimeSeriesChart`. Kept generic
 * (a `date` plus arbitrary numeric series keyed by `dataKey`).
 */
export type TimeSeriesPoint = {
	date: string;
	[key: string]: number | string;
};

export type TimeSeriesConfig = {
	dataKey: string;
	name: string;
	stroke?: string;
	strokeDasharray?: string;
};

/**
 * Per-partner activity metrics rendered on the (legacy) partner-detail charts —
 * distinct from the dashboard read model below. Kept for `SelectedPartnerStore`.
 */
export type DashboardMetrics = {
	salesOverTime: TimeSeriesPoint[];
	saleRefundsOverTime: TimeSeriesPoint[];
	suppliesOverTime: TimeSeriesPoint[];
	supplyRefundsOverTime: TimeSeriesPoint[];
	transactionCount: number;
	refundCount: number;
	outstandingCount: number;
};

/* ───────────────────────── Главное (dashboard) ───────────────────────── */

/**
 * The dashboard is a read-only morning briefing (mvp-plan §2). It has no backend
 * endpoint — it is a served, aggregated read model, mocked at the target v1
 * contract (docs/mocking.md). The debt-derived figures (receivables, payables,
 * aging, top debtors) are computed from the same seed as the «Долги» mock so the
 * two screens reconcile; the time series + revenue are illustrative. Every
 * amount is server-computed and served (hard rule 8 / rule 12).
 */
export type DashboardPeriod = "today" | "week" | "month";

/** One x-axis point across both charts (sales/supplies + payments). */
export type DashboardSeriesPoint = {
	/** X-axis label, e.g. "09:00" (today) or "07.06" (week/month). */
	label: string;
	sales: number;
	supplies: number;
	/** Money in / out for the payments chart. */
	payin: number;
	payout: number;
	/** Per-wallet split of payin/payout, aligned to `DashboardData.wallets`. */
	walletPayin: number[];
	walletPayout: number[];
};

/** A money-location filter option for the payments chart (self-contained). */
export type DashboardWallet = {
	id: number;
	name: string;
	type: "cash" | "bank";
};

/** A KPI card figure: the value, a period-over-period delta, and a sparkline. */
export type DashboardKpi = {
	value: number;
	/** % change vs the previous period; null when not applicable. */
	deltaPct: number | null;
	/** Open-transaction count shown in the card footer. */
	count: number;
	/** Sparkline points. */
	trend: number[];
};

export type DashboardAgingBucketKey = "0-7" | "8-30" | "31-60" | "60+";

export type DashboardAgingBucket = {
	bucket: DashboardAgingBucketKey;
	amount: number;
};

export type DashboardDebtor = {
	partnerId: number;
	name: string;
	company: string | null;
	/** Outstanding receivable (positive). */
	amount: number;
};

export type DashboardTxStatus = "paid" | "partial" | "unpaid";

export type DashboardRecentTransaction = {
	id: number;
	/** ISO date-time. */
	date: string;
	partnerName: string;
	type: "Sale" | "Supply";
	total: number;
	paid: number;
	status: DashboardTxStatus;
};

export type DashboardData = {
	businessName: string;
	period: DashboardPeriod;
	/** Period-over-period revenue trend. */
	revenue: DashboardKpi;
	/** Total receivables (they owe us). */
	receivable: DashboardKpi;
	/** Total payables (we owe). */
	payable: DashboardKpi;
	/** Overdue receivables (aged 31+ days); `partnerCount` = distinct partners. */
	overdue: DashboardKpi & { partnerCount: number };
	series: DashboardSeriesPoint[];
	wallets: DashboardWallet[];
	/** Receivables split into age buckets (sum to `receivable.value`). */
	aging: DashboardAgingBucket[];
	/** Five largest receivable partners. */
	topDebtors: DashboardDebtor[];
	recentTransactions: DashboardRecentTransaction[];
};
