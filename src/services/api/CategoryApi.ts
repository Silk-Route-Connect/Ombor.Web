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

	// Create/update responses carry no `productCount`; re-read the full CategoryDto
	// so the count column and the delete guard stay correct after a write (F3).
	async create(request: CreateCategoryRequest): Promise<Category> {
		const { data } = await http.post<{ id: number }>(this.baseUrl, request);

		return this.getById(data.id);
	}

	async update(request: UpdateCategoryRequest): Promise<Category> {
		await http.put(this.getUrlWithId(request.id), request);

		return this.getById(request.id);
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
