import {
	Category,
	CreateCategoryRequest,
	GetCategoriesRequest,
	UpdateCategoryRequest,
} from "../../models/category";
import { toQueryString } from "../../utils/toQueryParameters";
import http from "../api/http";

class CategoryApi {
	private readonly baseUrl: string = "/api/categories";

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

	private getUrl(request?: GetCategoriesRequest): string {
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

const categoryApi = new CategoryApi();
export default categoryApi;
