import {
	AddOpeningStockRequest,
	CreateWarehouseRequest,
	UpdateWarehouseRequest,
	Warehouse,
	WarehouseMovement,
	WarehouseStockItem,
} from "../../models/warehouse";
import http from "./http";

/**
 * Warehouses API over the target v1 contract (`/api/warehouses`). The resource
 * is fully mocked (docs/mocking.md) — the real backend exposes a stale
 * `/api/inventories` with no served aggregates, no archive and no movements.
 * JSON throughout (no file upload), mirroring CategoryApi.
 */
class WarehouseApi {
	private readonly baseUrl: string = "/api/warehouses";

	/** Full collection — no query params; search/filter are client-side in v1. */
	async getAll(): Promise<Warehouse[]> {
		const response = await http.get<Warehouse[]>(this.baseUrl);

		return response.data;
	}

	async getById(id: number): Promise<Warehouse> {
		const response = await http.get<Warehouse>(this.getUrlWithId(id));

		return response.data;
	}

	/** The «Остатки» tab — products held in this warehouse with WAC + value. */
	async getStock(id: number): Promise<WarehouseStockItem[]> {
		const response = await http.get<WarehouseStockItem[]>(`${this.getUrlWithId(id)}/stock`);

		return response.data;
	}

	/** The «Движения» tab — the warehouse stock ledger, newest first. */
	async getMovements(id: number): Promise<WarehouseMovement[]> {
		const response = await http.get<WarehouseMovement[]>(`${this.getUrlWithId(id)}/movements`);

		return response.data;
	}

	async create(request: CreateWarehouseRequest): Promise<Warehouse> {
		const response = await http.post<Warehouse>(this.baseUrl, request);

		return response.data;
	}

	async update(request: UpdateWarehouseRequest): Promise<Warehouse> {
		const response = await http.put<Warehouse>(this.getUrlWithId(request.id), request);

		return response.data;
	}

	async archive(id: number): Promise<Warehouse> {
		const response = await http.post<Warehouse>(`${this.getUrlWithId(id)}/archive`);

		return response.data;
	}

	async restore(id: number): Promise<Warehouse> {
		const response = await http.post<Warehouse>(`${this.getUrlWithId(id)}/restore`);

		return response.data;
	}

	/** Record an opening-stock event — an audited stock-in (rule 22). */
	async addOpeningStock(id: number, request: AddOpeningStockRequest): Promise<Warehouse> {
		const response = await http.post<Warehouse>(`${this.getUrlWithId(id)}/opening-stock`, request);

		return response.data;
	}

	/**
	 * Hard-delete — allowed by the mock only when the warehouse is unreferenced
	 * (204); a referenced warehouse returns 409 and must be archived instead
	 * (business-rules rule 32). Mirrors PartnerApi.delete.
	 */
	async delete(id: number): Promise<void> {
		await http.delete(this.getUrlWithId(id));
	}

	private getUrlWithId(id: number): string {
		return `${this.baseUrl}/${id}`;
	}
}

const warehouseApi = new WarehouseApi();
export default warehouseApi;
