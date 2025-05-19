import { toQueryString } from "utils/toQueryParameters";

import {
	CreateProductRequest,
	GetProductsRequest,
	ProductDto,
	UpdateProductRequest,
} from "../../models/product";
import http from "./http";

export class ProductApi {
	private readonly baseUrl: string = "/api/products";

	async getAll(request: GetProductsRequest): Promise<ProductDto[]> {
		const url = this.getUrl(request);
		const response = await http.get<ProductDto[]>(url);

		return response.data;
	}

	async getById(id: number): Promise<ProductDto> {
		const url = this.getUrlWithId(id);
		const response = await http.get<ProductDto>(url);

		return response.data;
	}

	async create(request: CreateProductRequest): Promise<ProductDto> {
		const url = this.getUrl();
		const response = await http.post<ProductDto>(url, request);

		return response.data;
	}

	async update(request: UpdateProductRequest): Promise<ProductDto> {
		const url = this.getUrlWithId(request.id);
		const response = await http.put<ProductDto>(url, request);

		return response.data;
	}

	async delete(id: number): Promise<void> {
		const url = this.getUrlWithId(id);
		await http.delete(url);
	}

	private getUrl(request?: GetProductsRequest): string {
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

export default new ProductApi();
