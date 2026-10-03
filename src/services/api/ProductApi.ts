import {
	CreateProductRequest,
	Product,
	ProductMovement,
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

	/** Full dataset — no query params; search/filter/sort/paging are client-side. */
	async getAll(): Promise<Product[]> {
		const response = await http.get<Product[]>(this.baseUrl);

		return response.data;
	}

	async getById(id: number): Promise<Product> {
		const response = await http.get<Product>(this.getUrlWithId(id));

		return response.data;
	}

	async getTransactions(productId: number): Promise<ProductTransaction[]> {
		const url = `${this.getUrlWithId(productId)}/transactions`;
		const response = await http.get<ProductTransaction[]>(url);

		return response.data;
	}

	async getMovements(productId: number): Promise<ProductMovement[]> {
		const url = `${this.getUrlWithId(productId)}/movements`;
		const response = await http.get<ProductMovement[]>(url);

		return response.data;
	}

	async create(request: CreateProductRequest): Promise<Product> {
		// The create response omits `isDeletable`; re-read so the list never holds a
		// partial product (F1, same write-then-re-read as PartnerApi).
		const form = this.getFormData(request);
		const { data } = await http.post<{ id: number }>(this.baseUrl, form, formHeaders);

		return this.getById(data.id);
	}

	async update(request: UpdateProductRequest): Promise<Product> {
		// The PUT response is the lean UpdateProductResponse (no images, warehouse
		// items, stock or cost). Storing it crashed the detail page (F1) — re-read
		// the full ProductDto instead.
		const form = this.getFormData(request);
		await http.put(this.getUrlWithId(request.id), form, formHeaders);

		return this.getById(request.id);
	}

	/** Archive — the backend returns 204 No Content (no body). */
	async archive(id: number): Promise<void> {
		await http.post(`${this.getUrlWithId(id)}/archive`);
	}

	/** Restore — the backend returns 204 No Content (no body). */
	async restore(id: number): Promise<void> {
		await http.post(`${this.getUrlWithId(id)}/restore`);
	}

	/** Hard-delete — allowed only while the product is unreferenced (409 `entity.referenced` otherwise). */
	async delete(id: number): Promise<void> {
		await http.delete(this.getUrlWithId(id));
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
