import {
	CashFlowReport,
	ExpensesReport,
	GroupedReportRequest,
	LossesReport,
	ProfitReport,
	PurchasesReport,
	ReportPeriodRequest,
	SalesReport,
	StockReport,
} from "../../models/report";
import BaseApi from "./BaseApi";
import http from "./http";

/** Reports API (`/api/reports/*`) — read-only aggregates for the «Отчёты» section. */
class ReportApi extends BaseApi {
	constructor() {
		super("reports");
	}

	private async get<T>(path: string, request: object): Promise<T> {
		const { data } = await http.get<T>(`${this.baseUrl}/${path}`, { params: request });
		return data;
	}

	getSales(request: GroupedReportRequest): Promise<SalesReport> {
		return this.get("sales", request);
	}

	getPurchases(request: GroupedReportRequest): Promise<PurchasesReport> {
		return this.get("purchases", request);
	}

	/** Today's stock; every warehouse unless one is given. */
	getStock(request: { warehouseId?: number }): Promise<StockReport> {
		return this.get("stock", request);
	}

	getCashFlow(request: ReportPeriodRequest): Promise<CashFlowReport> {
		return this.get("cash-flow", request);
	}

	getExpenses(request: ReportPeriodRequest): Promise<ExpensesReport> {
		return this.get("expenses", request);
	}

	getLosses(request: ReportPeriodRequest): Promise<LossesReport> {
		return this.get("losses", request);
	}

	/** Day / Week / Month only — an entity grouping is a 400. */
	getProfit(request: GroupedReportRequest): Promise<ProfitReport> {
		return this.get("profit", request);
	}
}

const reportApi = new ReportApi();
export default reportApi;
