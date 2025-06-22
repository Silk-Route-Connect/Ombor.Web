import { TransactionRecord } from "models/transaction";

import {
	CreatePartnerRequest,
	GetPartnersRequest,
	Partner,
	UpdateParatnerRequest,
} from "../../models/partner";
import BaseApi from "./BaseApi";
import http from "./http";

class PartnerApi extends BaseApi {
	constructor() {
		super("partners");
	}

	async getAll(request?: GetPartnersRequest | null): Promise<Partner[]> {
		const url = this.getUrl(request);
		const response = await http.get<Partner[]>(url);

		return response.data;
	}

	async getById(id: number): Promise<Partner> {
		const url = this.getUrlWithId(id);
		const response = await http.get<Partner>(url);

		return response.data;
	}

	async getSupplies(id: number): Promise<TransactionRecord[]> {
		const url = `${this.getUrlWithId(id)}/transactions?type=Supply`;
		const response = await http.get<TransactionRecord[]>(url);

		return response.data;
	}

	async getSales(id: number): Promise<TransactionRecord[]> {
		const url = `${this.getUrlWithId(id)}/transactions?type=Sale`;
		const response = await http.get<TransactionRecord[]>(url);

		return response.data;
	}

	async create(request: CreatePartnerRequest): Promise<Partner> {
		const url = this.getUrl();
		const response = await http.post<Partner>(url, request);

		return response.data;
	}

	async update(request: UpdateParatnerRequest): Promise<Partner> {
		const url = this.getUrlWithId(request.id);
		const response = await http.put<Partner>(url, request);

		return response.data;
	}

	async delete(id: number): Promise<void> {
		const url = this.getUrlWithId(id);
		await http.delete(url);
	}
}

export default new PartnerApi();
