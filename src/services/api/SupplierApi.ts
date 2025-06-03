import {
	CreateSupplierRequest,
	GetSuppliersRequest,
	Supplier,
	UpdateSupplierRequest,
} from "../../models/supplier";
import { toQueryString } from "../../utils/toQueryParameters";
import http from "../api/http";

class SupplierApi {
	private readonly baseUrl: string = "/api/suppliers";

	async getAll(request?: GetSuppliersRequest | null): Promise<Supplier[]> {
		const url = this.getUrl(request);
		const response = await http.get<Supplier[]>(url);

		return response.data;
	}

	async getById(id: number): Promise<Supplier> {
		const url = this.getUrlWithId(id);
		const response = await http.get<Supplier>(url);

		return response.data;
	}

	async create(request: CreateSupplierRequest): Promise<Supplier> {
		const url = this.getUrl();
		const response = await http.post<Supplier>(url, request);

		return response.data;
	}

	async update(request: UpdateSupplierRequest): Promise<Supplier> {
		const url = this.getUrlWithId(request.id);
		const response = await http.put<Supplier>(url, request);

		return response.data;
	}

	async delete(id: number): Promise<void> {
		const url = this.getUrlWithId(id);
		await http.delete(url);
	}

	private getUrl(request?: GetSuppliersRequest | null): string {
		if (!request) {
			return this.baseUrl;
		}

		const query = toQueryString(request);

		return query ? `${this.baseUrl}?${query}` : this.baseUrl;
	}

	private getUrlWithId(id: number): string {
		return `${this.baseUrl}/${id}`;
	}
}

const supplierApi = new SupplierApi();
export default supplierApi;
