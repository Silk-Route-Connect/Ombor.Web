import { CreatePaymentRequest, GetPaymentsRequest, Payment } from "models/payment";

import BaseApi, { PrimitiveTypes } from "./BaseApi";
import http from "./http";

class PaymentApi extends BaseApi {
	constructor() {
		super("payments");
	}

	async getAll(request?: GetPaymentsRequest): Promise<Payment[]> {
		const url = this.getUrl(request);
		const response = await http.get<Payment[]>(url);

		return response.data;
	}

	async getById(id: number): Promise<Payment> {
		const url = this.getUrl(id);
		const response = await http.get<Payment>(url);

		return response.data;
	}

	async create(request: CreatePaymentRequest): Promise<Payment> {
		const url = this.getUrl();
		const formData = this.getPaymentFormData(request);

		const response = await http.post<Payment>(url, formData, this.formHeaders);

		return response.data;
	}

	private getPaymentFormData(request: CreatePaymentRequest): FormData {
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

		if (request.attachments) {
			request.attachments.forEach((file) => {
				form.append("attachments", file, file.name);
			});
		}

		return form;
	}
}

export default new PaymentApi();
