import { WalletType } from "./wallet";

/* ───────────────────────── Главное (dashboard) ───────────────────────── */

/**
 * The dashboard is a read-only morning briefing (mvp-plan §2), served by
 * `/api/dashboard` as an aggregated read model. The debt-derived figures
 * (receivables, payables, aging, top debtors) come from the same data as
 * «Долги», so the two screens reconcile. Every amount is server-computed and
 * served (hard rule 8 / rule 12).
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
	/** Sale refunds in the bucket (revenue = sales − saleRefunds). */
	saleRefunds: number;
};

/** A money-location filter option for the payments chart (self-contained). */
export type DashboardWallet = {
	id: number;
	name: string;
	type: WalletType;
};

/** A KPI card figure: the value, a change in %, and a sparkline. */
export type DashboardKpi = {
	value: number;
	/**
	 * Flows (revenue, refunds): vs the preceding equal period; positions
	 * (receivable, payable): vs the start of the period; null when the basis is 0.
	 */
	deltaPct: number | null;
	/** Documents for flows, partners for positions. */
	count: number;
	/** One value per `series` bucket: the flow in the bucket, or the position at its end. */
	trend: number[];
};

/** Carrying value of all stock (Σ quantity × WAC, archived warehouses included). */
export type DashboardStockValue = {
	value: number;
	/** Distinct products in stock. */
	productCount: number;
	/** Warehouses holding stock. */
	warehouseCount: number;
};

/**
 * Gross profit in the period: net revenue − cost of the goods sold, each line at
 * the cost snapshotted when it was recorded — the same figure as the «Продажи»
 * report for those days. A null the API serves is left out of the JSON.
 */
export type DashboardGrossProfit = {
	value: number;
	/** vs the preceding equal period; null when that was 0. */
	deltaPct?: number | null;
	/** Gross profit within each `series` bucket (they add up to `value`). */
	trend: number[];
	/** value ÷ net revenue × 100; null unless net revenue > 0. */
	marginPercent?: number | null;
	/** Any cost behind it is a pre-2026-10-04 estimate. */
	costIsEstimated: boolean;
};

/** A wallet and its served balance (the same figure as the wallet page). */
export type DashboardWalletBalance = {
	id: number;
	name: string;
	type: WalletType;
	balance: number;
	isArchived: boolean;
};

/** Money in all wallets (archived included), with its trend and per-wallet balances. */
export type DashboardCash = {
	value: number;
	/** vs the start of the period; null when that was 0. */
	deltaPct: number | null;
	/** Cash at the end of each `series` bucket (last = `value`). */
	trend: number[];
	/** By name. */
	wallets: DashboardWalletBalance[];
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
	partnerId: number;
	partnerName: string;
	type: "Sale" | "Supply";
	total: number;
	paid: number;
	status: DashboardTxStatus;
	/** The document's bare number («42»; differs from `id`); null for a legacy row. */
	transactionNumber: string | null;
};

export type DashboardData = {
	businessName: string;
	period: DashboardPeriod;
	/** Sales net of sale refunds in the period; `count` = sales documents. */
	revenue: DashboardKpi;
	/** What partners owe us — net partner positions, the same figure as `GET /api/debts/summary`; `count` = partners. */
	receivable: DashboardKpi;
	/** What we owe partners (net positions); `count` = partners. */
	payable: DashboardKpi;
	/** The receivable aged 31+ days; `count` = documents, `partnerCount` = distinct partners. */
	overdue: DashboardKpi & { partnerCount: number };
	series: DashboardSeriesPoint[];
	wallets: DashboardWallet[];
	/** Receivables split into age buckets (sum to `receivable.value`). */
	aging: DashboardAgingBucket[];
	/** Five largest receivable partners. */
	topDebtors: DashboardDebtor[];
	recentTransactions: DashboardRecentTransaction[];
	/** Sale refunds in the period (already netted out of `revenue`); `count` = refund documents. */
	saleRefunds: DashboardKpi;
	stockValue: DashboardStockValue;
	cash: DashboardCash;
	grossProfit: DashboardGrossProfit;
};
