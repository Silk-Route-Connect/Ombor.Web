import { isReady, Loadable } from "helpers/Loading";
import i18next from "i18n/config";
import { makeAutoObservable } from "mobx";
import {
	CashFlowReport,
	ExpensesReport,
	LossesReport,
	ProfitReport,
	PurchasesReport,
	ReportGroupBy,
	SalesReport,
	StockReport,
	StockReportRow,
} from "models/report";
import ReportApi from "services/api/ReportApi";
import { DateRangeValue, toDayParams } from "utils/dateRange";
import {
	GroupedReportKind,
	isGroupedReport,
	MAX_REPORT_DAYS,
	periodDays,
	REPORT_GROUPINGS,
	ReportKind,
	ReportQuery,
} from "utils/report/reportQuery";
import { matchesStockFilter, StockFilter } from "utils/stockLevel";
import { matchesSearch } from "utils/stringUtils";

import { NotificationStore } from "./NotificationStore";
import { ReportResource } from "./ReportResource";

/** Reports open on «Этот месяц» — the API's own default period. */
const DEFAULT_PERIOD: DateRangeValue = { preset: "month" };

export interface IReportStore {
	/** One period for every dated report, so switching reports keeps the days. */
	dateRange: DateRangeValue;
	groupBy: Record<GroupedReportKind, ReportGroupBy>;
	stockWarehouseId: number | null;
	stockSearch: string;
	stockLevel: StockFilter;

	sales: ReportResource<SalesReport>;
	profit: ReportResource<ProfitReport>;
	purchases: ReportResource<PurchasesReport>;
	stock: ReportResource<StockReport>;
	cashFlow: ReportResource<CashFlowReport>;
	expenses: ReportResource<ExpensesReport>;
	losses: ReportResource<LossesReport>;

	/** Stock rows after the screen-side search and «Остаток» filter. */
	readonly filteredStockRows: Loadable<StockReportRow[]>;

	/** Shows a report: remembers it as the one filter changes reload, and loads it. */
	open(kind: ReportKind): Promise<void>;
	reload(): Promise<void>;
	/** False (with a toast) when the period is longer than the API allows. */
	setDateRange(value: DateRangeValue): boolean;
	setGroupBy(kind: GroupedReportKind, value: ReportGroupBy): void;
	setStockWarehouse(warehouseId: number | null): void;
	setStockSearch(value: string): void;
	setStockLevel(value: StockFilter): void;
	/** Narrows the stock report to one warehouse (or all) and one «Остаток» level, search off — a link from another page. */
	presetStock(warehouseId: number | null, level: StockFilter): void;
	/** The filters of a report, for its print URL. */
	queryOf(kind: ReportKind): ReportQuery;
	/** Takes the filters a print URL carries (a reload or a shared link reopens the same report). */
	applyQuery(kind: ReportKind, query: Partial<ReportQuery>): void;
	close(): void;
}

/**
 * «Отчёты» (scope-8): the shared filters and one served snapshot per report.
 * Nothing is computed here — every figure is the API's (hard rule 8); the store
 * only narrows the stock rows on screen by search and stock level.
 */
export class ReportStore implements IReportStore {
	private readonly notificationStore: NotificationStore;
	private active: ReportKind | null = null;

	dateRange: DateRangeValue = DEFAULT_PERIOD;
	groupBy: Record<GroupedReportKind, ReportGroupBy> = {
		sales: "Day",
		purchases: "Day",
		profit: "Day",
	};
	stockWarehouseId: number | null = null;
	stockSearch = "";
	stockLevel: StockFilter = "all";

	readonly sales: ReportResource<SalesReport>;
	readonly profit: ReportResource<ProfitReport>;
	readonly purchases: ReportResource<PurchasesReport>;
	readonly stock: ReportResource<StockReport>;
	readonly cashFlow: ReportResource<CashFlowReport>;
	readonly expenses: ReportResource<ExpensesReport>;
	readonly losses: ReportResource<LossesReport>;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		this.sales = new ReportResource<SalesReport>();
		this.profit = new ReportResource<ProfitReport>();
		this.purchases = new ReportResource<PurchasesReport>();
		this.stock = new ReportResource<StockReport>();
		this.cashFlow = new ReportResource<CashFlowReport>();
		this.expenses = new ReportResource<ExpensesReport>();
		this.losses = new ReportResource<LossesReport>();
		makeAutoObservable(this, {}, { autoBind: true });
	}

	get filteredStockRows(): Loadable<StockReportRow[]> {
		const data = this.stock.data;
		if (!isReady(data)) {
			return data;
		}
		const term = this.stockSearch.trim();
		return data.rows.filter(
			(row) =>
				matchesStockFilter(row, this.stockLevel) &&
				(!term || matchesSearch(row.productName, term) || matchesSearch(row.sku, term)),
		);
	}

	async open(kind: ReportKind): Promise<void> {
		this.active = kind;
		await this.reload();
	}

	reload(): Promise<void> {
		const period = toDayParams(this.dateRange);
		switch (this.active) {
			case "sales":
				return this.sales.load(() =>
					ReportApi.getSales({ ...period, groupBy: this.groupBy.sales }),
				);
			case "purchases":
				return this.purchases.load(() =>
					ReportApi.getPurchases({ ...period, groupBy: this.groupBy.purchases }),
				);
			case "profit":
				return this.profit.load(() =>
					ReportApi.getProfit({ ...period, groupBy: this.groupBy.profit }),
				);
			case "stock":
				return this.stock.load(() =>
					ReportApi.getStock({ warehouseId: this.stockWarehouseId ?? undefined }),
				);
			case "cashFlow":
				return this.cashFlow.load(() => ReportApi.getCashFlow(period));
			case "expenses":
				return this.expenses.load(() => ReportApi.getExpenses(period));
			case "losses":
				return this.losses.load(() => ReportApi.getLosses(period));
			default:
				return Promise.resolve();
		}
	}

	setDateRange(value: DateRangeValue): boolean {
		if (value.preset === "all" || (periodDays(value) ?? 0) > MAX_REPORT_DAYS) {
			this.notificationStore.info(i18next.t("report.period.tooLong"));
			return false;
		}
		this.dateRange = value;
		void this.reload();
		return true;
	}

	setGroupBy(kind: GroupedReportKind, value: ReportGroupBy): void {
		this.groupBy[kind] = value;
		void this.reload();
	}

	setStockWarehouse(warehouseId: number | null): void {
		this.stockWarehouseId = warehouseId;
		void this.reload();
	}

	setStockSearch(value: string): void {
		this.stockSearch = value;
	}

	setStockLevel(value: StockFilter): void {
		this.stockLevel = value;
	}

	presetStock(warehouseId: number | null, level: StockFilter): void {
		this.stockWarehouseId = warehouseId;
		this.stockSearch = "";
		this.stockLevel = level;
	}

	queryOf(kind: ReportKind): ReportQuery {
		if (kind === "stock") {
			return {
				period: this.dateRange,
				warehouseId: this.stockWarehouseId,
				search: this.stockSearch,
				level: this.stockLevel,
			};
		}
		return {
			period: this.dateRange,
			groupBy: isGroupedReport(kind) ? this.groupBy[kind] : undefined,
		};
	}

	applyQuery(kind: ReportKind, query: Partial<ReportQuery>): void {
		if (query.period && (periodDays(query.period) ?? 0) <= MAX_REPORT_DAYS) {
			this.dateRange = query.period;
		}
		if (query.groupBy && isGroupedReport(kind)) {
			const allowed: readonly ReportGroupBy[] = REPORT_GROUPINGS[kind];
			if (allowed.includes(query.groupBy)) {
				this.groupBy[kind] = query.groupBy;
			}
		}
		if (kind === "stock") {
			this.stockWarehouseId = query.warehouseId ?? null;
			this.stockSearch = query.search ?? "";
			this.stockLevel = query.level ?? "all";
		}
	}

	close(): void {
		this.active = null;
		[
			this.sales,
			this.profit,
			this.purchases,
			this.stock,
			this.cashFlow,
			this.expenses,
			this.losses,
		].forEach((resource) => resource.clear());
	}
}

export default ReportStore;
