import {
	Category,
	CreateCategoryRequest,
	GetCategoriesRequest,
	UpdateCategoryRequest,
} from "../../models/category";
import { toQueryString } from "../../utils/toQueryParameters";
import http from "../api/http";

class CategoryApi {
	async getAll(request: GetCategoriesRequest): Promise<Category[]> {
		const url = this.getUrl(request);
		const response = await http.get<Category[]>(url);

		return response.data;
	}

	async getById(id: number): Promise<Category> {
		const url = this.getUrlWithId(id);
		const response = await http.get<Category>(url);

		return response.data;
	}

	async create(request: CreateCategoryRequest): Promise<Category> {
		const url = this.getUrl();
		const response = await http.post<Category>(url, request);

		return response.data;
	}

	async update(request: UpdateCategoryRequest): Promise<Category> {
		const url = this.getUrlWithId(request.id);
		const response = await http.put<Category>(url, request);

		return response.data;
	}

	async delete(id: number): Promise<void> {
		const url = this.getUrlWithId(id);
		await http.delete(url);
	}

	private getUrl<TRequest>(request?: TRequest): string {
		if (!request) {
			return "/api/categories";
		}

		const query = toQueryString(request);
		return `/api/categories?${query}`;
	}

	private getUrlWithId(id: number): string {
		return `/api/categories/${id}`;
	}
}

const api = new CategoryApi();
export default api;
