import { toQueryString } from "utils/toQueryParameters";

import {
	CreateProductRequest,
	GetProductsRequest,
	Product,
	ProductTransaction,
	UpdateProductRequest,
} from "../../models/product";
import http from "./http";

const formHeaders = {
	headers: {
		"Content-Type": "multipart/form-data",
		Accept: "application/json",
	},
};

const primitiveTypes = ["string", "number", "boolean"];

export class ProductApi {
	private readonly baseUrl: string = "/api/products";

	async getAll(request?: GetProductsRequest): Promise<Product[]> {
		const url = this.getUrl(request);
		const response = await http.get<Product[]>(url);

		return response.data;
	}

	async getById(id: number): Promise<Product> {
		const url = this.getUrlWithId(id);
		const response = await http.get<Product>(url);

		return response.data;
	}

	async getTransactions(productId: number): Promise<ProductTransaction[]> {
		const url = `${this.getUrlWithId(productId)}/transactions`;
		const response = await http.get<ProductTransaction[]>(url);

		return response.data;
	}

	async create(request: CreateProductRequest): Promise<Product> {
		const url = this.getUrl();
		const form = this.getFormData(request);

		const response = await http.post<Product>(url, form, formHeaders);
		return response.data;
	}

	async update(request: UpdateProductRequest): Promise<Product> {
		const url = this.getUrlWithId(request.id);
		const form = this.getFormData(request);
		const response = await http.put<Product>(url, form, formHeaders);

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

	private getFormData(request: CreateProductRequest | UpdateProductRequest): FormData {
		const form = new FormData();
		const packaging = request.packaging;

		const { attachments, imagesToDelete, ...rest } = request as UpdateProductRequest;

		Object.entries(rest).forEach(([key, val]) => {
			if (val !== null && primitiveTypes.includes(typeof val)) {
				form.append(key, String(val));
			}
		});

		if (packaging) {
			if (packaging.size != null) form.append("packaging.size", String(packaging.size));
			if (packaging.label != null) form.append("packaging.label", packaging.label);
			if (packaging.barcode != null) form.append("packaging.barcode", packaging.barcode);
		}

		attachments?.forEach((file) => form.append("attachments", file));
		imagesToDelete?.forEach((imgId) => form.append("imagesToDelete", String(imgId)));

		return form;
	}
}

export default new ProductApi();
