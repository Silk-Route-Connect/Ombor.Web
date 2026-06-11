import { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../../models/category";
import http from "../api/http";

class CategoryApi {
	private readonly baseUrl: string = "/api/categories";

	// Full collection — no query params. Search/sort/pagination are client-side
	// in v1 (docs/mocking.md — client-side-operations rule).
	async getAll(): Promise<Category[]> {
		const response = await http.get<Category[]>(this.baseUrl);

		return response.data;
	}

	async getById(id: number): Promise<Category> {
		const response = await http.get<Category>(this.getUrlWithId(id));

		return response.data;
	}

	async create(request: CreateCategoryRequest): Promise<Category> {
		const response = await http.post<Category>(this.baseUrl, request);

		return response.data;
	}

	async update(request: UpdateCategoryRequest): Promise<Category> {
		const response = await http.put<Category>(this.getUrlWithId(request.id), request);

		return response.data;
	}

	async delete(id: number): Promise<void> {
		await http.delete(this.getUrlWithId(id));
	}

	private getUrlWithId(id: number): string {
		return `${this.baseUrl}/${id}`;
	}
}

const categoryApi = new CategoryApi();
export default categoryApi;
