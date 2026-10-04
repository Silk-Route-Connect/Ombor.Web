import { PaymentType } from "./payment";
import { Measurement } from "./product";
import { AdjustmentReason } from "./stockAdjustment";
import { WalletType } from "./wallet";

/* ───────────────────────── «Отчёты» (/api/reports/*) ───────────────────────── */

/**
 * Read-only aggregates over the event ledger (backend-contracts/reports.md):
 * nothing is stored, every figure is derived per request and reconciles with the
 * module lists for the same days. Periods are local (Tashkent) calendar days,
 * both ends inclusive; a null the API serves is left out of the JSON, so an
 * optional nullable field may also be `undefined`.
 */
export const REPORT_GROUP_BY = [
	"Day",
	"Week",
	"Month",
	"Product",
	"Category",
	"Partner",
	"Warehouse",
] as const;
export type ReportGroupBy = (typeof REPORT_GROUP_BY)[number];

/** The calendar buckets: every bucket of the period, oldest first. */
export const TIME_GROUP_BY = ["Day", "Week", "Month"] as const;
export type ReportTimeGroupBy = (typeof TIME_GROUP_BY)[number];

export const isTimeGroupBy = (groupBy: ReportGroupBy): groupBy is ReportTimeGroupBy =>
	(TIME_GROUP_BY as readonly string[]).includes(groupBy);

/** Inclusive local days «yyyy-MM-dd»; the API defaults to «этот месяц». */
export type ReportPeriodRequest = {
	from?: string;
	to?: string;
};

export type GroupedReportRequest = ReportPeriodRequest & { groupBy?: ReportGroupBy };

/** The resolved period every dated report echoes back. */
export type ReportPeriod = {
	from: string;
	to: string;
};

export type SalesReportFigures = {
	/** Sale documents. */
	documents: number;
	refundDocuments: number;
	/** Units sold − units returned, in base units (mixed units when a row spans products). */
	quantity: number;
	revenue: number;
	refunds: number;
	/** Revenue − refunds: the dashboard's «Выручка» for the same days. */
	netRevenue: number;
	/** Cost of goods sold − cost of the returned goods. */
	cost: number;
	grossProfit: number;
	/** grossProfit ÷ netRevenue × 100; null unless netRevenue > 0. */
	marginPercent?: number | null;
};

export type SalesReportRow = SalesReportFigures & {
	/** A bucket («2026-10-04», a week's Monday, «2026-10») or an entity id. */
	key: string;
	label: string;
	costIsEstimated: boolean;
};

export type SalesReport = ReportPeriod & {
	groupBy: ReportGroupBy;
	rows: SalesReportRow[];
	totals: SalesReportFigures;
	/** Any cost in the period is an estimate (lines recorded before 2026-10-04). */
	costIsEstimated: boolean;
};

export type PurchasesReportFigures = {
	documents: number;
	refundDocuments: number;
	quantity: number;
	purchases: number;
	refunds: number;
	netPurchases: number;
};

export type PurchasesReportRow = PurchasesReportFigures & { key: string; label: string };

export type PurchasesReport = ReportPeriod & {
	groupBy: ReportGroupBy;
	rows: PurchasesReportRow[];
	totals: PurchasesReportFigures;
};

export type StockReportRow = {
	warehouseId: number;
	warehouseName: string;
	warehouseIsArchived: boolean;
	productId: number;
	productName: string;
	sku: string;
	categoryName: string | null;
	measurement: Measurement;
	productIsArchived: boolean;
	quantity: number;
	averageCost: number;
	/** quantity × the warehouse's average cost. */
	value: number;
	salePrice: number;
	saleValue: number;
	lowStockThreshold: number;
	/** quantity ≤ threshold in this warehouse (the warehouse stock tab's rule). */
	isLowStock: boolean;
};

export type StockReportWarehouse = {
	warehouseId: number;
	name: string;
	isArchived: boolean;
	productCount: number;
	value: number;
	saleValue: number;
	lowStockCount: number;
};

export type StockReport = {
	rows: StockReportRow[];
	warehouses: StockReportWarehouse[];
	totals: {
		productCount: number;
		value: number;
		saleValue: number;
		lowStockCount: number;
	};
};

export type CashFlowFigures = {
	opening: number;
	/** The opening balance of a wallet created inside the period. */
	initialBalance: number;
	income: number;
	expense: number;
	transfersIn: number;
	transfersOut: number;
	closing: number;
};

export type CashFlowWallet = CashFlowFigures & {
	walletId: number;
	name: string;
	type: WalletType;
	isArchived: boolean;
};

export type CashFlowDay = Omit<CashFlowFigures, "opening"> & { date: string };

export type CashFlowReport = ReportPeriod & {
	wallets: CashFlowWallet[];
	byType: { type: PaymentType; income: number; expense: number; count: number }[];
	series: CashFlowDay[];
	totals: CashFlowFigures;
};

export type ExpensesReport = ReportPeriod & {
	total: number;
	count: number;
	byType: { type: PaymentType; amount: number; count: number }[];
	partners: { partnerId: number; name: string; amount: number; count: number }[];
	employees: { employeeId: number; name: string; amount: number; count: number }[];
	/** General expenses grouped by description (there is no expense category yet). */
	other: { description?: string | null; amount: number; count: number }[];
};

export type LossesReport = ReportPeriod & {
	value: number;
	count: number;
	products: {
		productId: number;
		productName: string;
		sku: string;
		measurement: Measurement;
		quantity: number;
		value: number;
		count: number;
	}[];
	reasons: { reason: AdjustmentReason; value: number; count: number }[];
};

export type ProfitReportFigures = {
	revenue: number;
	refunds: number;
	netRevenue: number;
	cost: number;
	grossProfit: number;
	losses: number;
	payroll: number;
	otherExpenses: number;
	profit: number;
};

export type ProfitReportRow = ProfitReportFigures & {
	key: string;
	label: string;
	costIsEstimated: boolean;
};

export type ProfitReport = ReportPeriod & {
	groupBy: ReportTimeGroupBy;
	rows: ProfitReportRow[];
	totals: ProfitReportFigures;
	costIsEstimated: boolean;
};
