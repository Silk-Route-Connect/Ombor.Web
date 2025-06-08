import { GetCategoriesRequest } from "models/category";
import { CreateSupplyRequest, Supply, SupplyItem, UpdateSupplyRequest } from "models/supply";

import { toQueryString } from "../../utils/toQueryParameters";
import http from "../api/http";

class SupplyApi {
	private readonly baseUrl: string = "/api/supplies";

	async getAll(request: GetCategoriesRequest): Promise<Supply[]> {
		// const url = this.getUrl(request);
		// const response = await http.get<Supply[]>(url);

		// return response.data;
		console.log("Fetching all supplies with request:", request);
		return await mockDelay(MOCK_SUPPLIES);
	}

	async getById(id: number): Promise<Supply> {
		const url = this.getUrlWithId(id);
		const response = await http.get<Supply>(url);

		return response.data;
	}

	async create(request: CreateSupplyRequest): Promise<Supply> {
		const url = this.getUrl();
		const response = await http.post<Supply>(url, request);

		return response.data;
	}

	async update(request: UpdateSupplyRequest): Promise<Supply> {
		const url = this.getUrlWithId(request.id);
		const response = await http.put<Supply>(url, request);

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

const supplyApi = new SupplyApi();
export default supplyApi;

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Create a list of 5 mock suppliers to choose from
const MOCK_SUPPLIERS = [
	{ id: 1, name: "ABC Trading Co." },
	{ id: 2, name: "Global Supplies LLC" },
	{ id: 3, name: "Sunrise Wholesale" },
	{ id: 4, name: "Premier Distribution" },
	{ id: 5, name: "Omega Imports" },
];

// Pre-generate 5 mock supplies, each with 5–15 items
const MOCK_SUPPLIES: Supply[] = Array.from({ length: 5 }, (_, idx) => {
	const supplier = MOCK_SUPPLIERS[idx % MOCK_SUPPLIERS.length];
	const numberOfItems = randomInt(5, 15);

	const items: SupplyItem[] = Array.from({ length: numberOfItems }, (_, itemIdx) => {
		const unitPrice = randomInt(10, 100);
		const quantity = randomInt(1, 10);
		return {
			id: itemIdx + 1,
			productId: randomInt(100, 200),
			productName: `Product ${randomInt(100, 200)}`,
			quantity,
			unitPrice,
			totalPrice: quantity * unitPrice,
		};
	});

	const totalDue = items.reduce((sum, i) => sum + i.totalPrice!, 0);
	// Simulate some partial payment
	const totalPaid = Math.floor(totalDue * Math.random() * 0.8);

	return {
		id: idx + 1,
		supplierName: supplier.name,
		supplierId: supplier.id,
		date: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
		totalDue,
		totalPaid,
		currency: "uzs",
		paymentType: "cash",
		items,
		notes: idx % 2 === 0 ? `Order comments #${idx + 1}` : undefined,
	};
});

// Simulate a random delay between 500ms and 1000ms
function mockDelay<T>(data: T): Promise<T> {
	const delay = randomInt(500, 1000);
	return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}
