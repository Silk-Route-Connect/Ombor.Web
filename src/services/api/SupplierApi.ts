import { GetSuppliesRequest, Supply } from "models/supply";

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
		console.log("Fetching suppliers with request:", request);
		return [
			{
				id: 1,
				name: "Test Supplier",
				companyName: "Test Company",
				address: "123 Test St",
				email: "test@mail.com",
				phoneNumbers: ["123-456-7890"],
				isActive: true,
				balance: 1000,
			},
		];
		// const url = this.getUrl(request);
		// const response = await http.get<Supplier[]>(url);

		// return response.data;
	}

	async getById(id: number): Promise<Supplier> {
		const url = this.getUrlWithId(id);
		const response = await http.get<Supplier>(url);

		return response.data;
	}

	async getSupplies(request?: GetSuppliesRequest): Promise<Supply[]> {
		console.log("Fetching supplies with request:", request);
		// If there were query parameters (e.g., supplierId or date filters),
		// you could filter mockSupplies here accordingly. For now, return all.
		return generateFakeSupplies();
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

function randomInt(min: number, max: number) {
	// inclusive min, inclusive max
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateWithinLastNDays(n: number) {
	const today = new Date();
	const past = new Date(today.getTime() - randomInt(0, n) * 24 * 60 * 60 * 1000);
	return past;
}

function generateFakeSupplies(): Supply[] {
	const supplies: Supply[] = [];
	const supplierId = 1;
	const supplierName = "Test Supplier";

	for (let supplyId = 1; supplyId <= 5; supplyId++) {
		const itemCount = randomInt(5, 15);
		const items = [];

		let totalDue = 0;

		for (let i = 1; i <= itemCount; i++) {
			const productId = randomInt(100, 200);
			const productName = `Product ${productId}`;
			const quantity = randomInt(1, 20);
			const unitPrice = parseFloat((Math.random() * 90 + 10).toFixed(2)); // between 10.00 and 100.00
			const totalPrice = parseFloat((quantity * unitPrice).toFixed(2));

			totalDue += totalPrice;

			items.push({
				id: i,
				productId,
				productName,
				quantity,
				unitPrice,
				totalPrice,
			});
		}

		totalDue = parseFloat(totalDue.toFixed(2));
		const totalPaid = parseFloat((Math.random() * totalDue).toFixed(2));

		const date = randomDateWithinLastNDays(30); // within last 30 days
		const notes = Math.random() < 0.5 ? `Notes for supply #${supplyId}` : undefined;

		supplies.push({
			id: supplyId,
			supplierId,
			supplierName,
			date: date,
			totalDue,
			totalPaid,
			items,
			paymentType: "card",
			currency: "uzs",
			...(notes ? { notes } : {}),
		});
	}

	return supplies;
}
