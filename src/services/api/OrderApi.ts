import { GetOrderByIdRequest, GetOrdersRequest, Order, UpdateOrderRequest } from "models/order";

import BaseApi from "./BaseApi";
import http from "./http";

/**
 * Orders API. Read + edit + the state-machine transitions
 * (process/ship/deliver/cancel/reject/return). `deliver` carries the chosen
 * write-off warehouse (the redesign picks it at delivery confirmation); the
 * other transitions take only the id. Mocked at the target v1 contract.
 */
class OrderApi extends BaseApi {
	constructor() {
		super("orders");
	}

	async getAll(request?: GetOrdersRequest | null): Promise<Order[]> {
		const url = this.getUrl(request);
		const response = await http.get<Order[]>(url);

		return response.data;
	}

	async getById(request: GetOrderByIdRequest): Promise<Order> {
		const url = this.getUrlWithId(request.id);
		const response = await http.get<Order>(url);

		return response.data;
	}

	async update(request: UpdateOrderRequest): Promise<Order> {
		const url = this.getUrlWithId(request.id);
		const response = await http.put<Order>(url, request);

		return response.data;
	}

	async process(id: number): Promise<Order> {
		const response = await http.post<Order>(`${this.getUrlWithId(id)}/process`);

		return response.data;
	}

	async ship(id: number): Promise<Order> {
		const response = await http.post<Order>(`${this.getUrlWithId(id)}/ship`);

		return response.data;
	}

	async deliver(id: number, warehouseId: number): Promise<Order> {
		const response = await http.post<Order>(`${this.getUrlWithId(id)}/deliver`, { warehouseId });

		return response.data;
	}

	async cancel(id: number): Promise<Order> {
		const response = await http.post<Order>(`${this.getUrlWithId(id)}/cancel`);

		return response.data;
	}

	async reject(id: number): Promise<Order> {
		const response = await http.post<Order>(`${this.getUrlWithId(id)}/reject`);

		return response.data;
	}

	async returnOrder(id: number): Promise<Order> {
		const response = await http.post<Order>(`${this.getUrlWithId(id)}/return`);

		return response.data;
	}
}

export default new OrderApi();
