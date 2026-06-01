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

export type DashboardMetrics = {
	salesOverTime: TimeSeriesPoint[];
	saleRefundsOverTime: TimeSeriesPoint[];
	suppliesOverTime: TimeSeriesPoint[];
	supplyRefundsOverTime: TimeSeriesPoint[];
	transactionCount: number;
	refundCount: number;
	outstandingCount: number;
};

/* ------------------------------------------------------------------ *
 * Dashboard summary ("Главное") — shape returned by the dashboard API.
 * Backend is not ready yet; served by a mock API instance for now.
 * ------------------------------------------------------------------ */

export type DashboardPeriod = "today" | "week" | "month";

/** One point on the sales/supplies/payments time-series. */
export interface DashboardSeriesPoint {
	label: string;
	sales: number;
	supplies: number;
	payin: number;
	payout: number;
	/** Per-wallet breakdown of payin/payout, aligned to DashboardSummary.wallets. */
	kin: number[];
	kout: number[];
}

export type WalletIcon = "all" | "cash" | "bank";

/** A cash register / account ("касса") used to filter the payments chart. */
export interface DashboardWallet {
	id: string;
	label: string;
	icon: WalletIcon;
}

export type KpiTone = "ink" | "positive" | "negative" | "warning";
export type DeltaDirection = "up" | "down" | "warn" | "flat";

export interface DashboardKpi {
	key: "revenue" | "receivable" | "payable" | "overdue";
	caption: string;
	value: number;
	/** Render the value with a leading sign (+/−) regardless of magnitude. */
	signed?: boolean;
	unit?: string;
	tone: KpiTone;
	deltaLabel: string;
	deltaDirection: DeltaDirection;
	subLabel: string;
	spark: number[];
}

export type AgingTone = "success" | "primary" | "warning" | "error";

export interface AgingBucket {
	label: string;
	amount: number;
	tone: AgingTone;
}

export interface TopDebtor {
	name: string;
	company: string;
	amount: number;
}

export type RecentTransactionStatus = "paid" | "part" | "unpaid";

export interface RecentTransaction {
	id: string;
	dateTime: string;
	partner: string;
	type: "sale" | "supply";
	typeLabel: string;
	amount: number;
	paid: number;
	status: RecentTransactionStatus;
}

export interface DashboardSummary {
	period: DashboardPeriod;
	/** Localized subtitle shown under the page title (e.g. "Май · по дням"). */
	periodSubtitle: string;
	kpis: DashboardKpi[];
	series: DashboardSeriesPoint[];
	wallets: DashboardWallet[];
	aging: {
		buckets: AgingBucket[];
		totalReceivable: number;
		overdueAmount: number;
		overdueCount: number;
	};
	topDebtors: TopDebtor[];
	recentTransactions: RecentTransaction[];
}
