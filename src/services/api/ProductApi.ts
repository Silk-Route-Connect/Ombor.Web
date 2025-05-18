import { CreateProductRequest, ProductDto, UpdateProductRequest } from "../../models/product";
import http from "./http";

export class ProductApi {
	/** GET /api/products */
	async getAll(): Promise<ProductDto[]> {
		const response = await http.get<ProductDto[]>("/api/products");
		return response.data;
	}

	/** GET /api/products/{id} */
	async getById(id: number): Promise<ProductDto> {
		const response = await http.get<ProductDto>(`/api/products/${id}`);
		return response.data;
	}

	/** POST /api/products */
	async create(product: CreateProductRequest): Promise<ProductDto> {
		const response = await http.post<ProductDto>("/api/products", product);
		return response.data;
	}

	/** PUT /api/products/{id} */
	async update(product: UpdateProductRequest): Promise<ProductDto> {
		const response = await http.put<ProductDto>(`/api/products/${product.id}`, product);
		return response.data;
	}

	/** DELETE /api/products/{id} */
	async delete(id: number): Promise<void> {
		await http.delete(`/api/products/${id}`);
	}
}

export default new ProductApi();
