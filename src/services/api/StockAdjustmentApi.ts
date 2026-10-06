import { CreateStockAdjustmentRequest, StockAdjustment } from "../../models/stockAdjustment";
import http from "./http";

/**
 * Stock-adjustments API (`/api/stock-adjustments`).
 * Adjustments are immutable (rule 23): only list + create, never update/delete.
 */
class StockAdjustmentApi {
	private readonly baseUrl: string = "/api/stock-adjustments";

	/** Full collection — no query params; search/filter/sort are client-side. */
	async getAll(): Promise<StockAdjustment[]> {
		const response = await http.get<StockAdjustment[]>(this.baseUrl);

		return response.data;
	}

	async create(request: CreateStockAdjustmentRequest): Promise<StockAdjustment> {
		const response = await http.post<StockAdjustment>(this.baseUrl, request);

		return response.data;
	}
}

const stockAdjustmentApi = new StockAdjustmentApi();
export default stockAdjustmentApi;
