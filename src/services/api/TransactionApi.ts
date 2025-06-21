import {
	CreateTransactionRequest,
	GetTransactionsRequest,
	TransactionRecord,
} from "models/transaction";

import BaseApi, { PrimitiveTypes } from "./BaseApi";
import http from "./http";

class TransactionApi extends BaseApi {
	constructor() {
		super("transactions");
	}

	async getAll(request?: GetTransactionsRequest | null): Promise<TransactionRecord[]> {
		const url = this.getUrl(request);
		const response = await http.get<TransactionRecord[]>(url);

		return response.data;
	}

	async getById(id: number): Promise<TransactionRecord> {
		const url = this.getUrlWithId(id);
		const response = await http.get<TransactionRecord>(url);

		return response.data;
	}

	async create(request: CreateTransactionRequest): Promise<TransactionRecord> {
		const url = this.getUrl();
		const form = this.getFormData(request);

		const response = await http.post<TransactionRecord>(url, form, this.formHeaders);

		return response.data;
	}

	private getFormData(request: CreateTransactionRequest): FormData {
		const form = new FormData();

		Object.entries(request).forEach(([key, val]) => {
			if (val == null) return;

			if (typeof val === "object") {
				return;
			}

			if (PrimitiveTypes.includes(typeof val)) {
				form.append(key, String(val));
			}
		});

		request.lines.forEach((line, i) => {
			form.append(`lines[${i}].productId`, String(line.productId));
			form.append(`lines[${i}].unitPrice`, String(line.unitPrice));
			form.append(`lines[${i}].quantity`, String(line.quantity));
			form.append(`lines[${i}].discount`, String(line.discount));
		});

		if (request.attachments) {
			request.attachments.forEach((file) => {
				form.append("attachments", file, file.name);
			});
		}

		return form;
	}
}

export default new TransactionApi();
