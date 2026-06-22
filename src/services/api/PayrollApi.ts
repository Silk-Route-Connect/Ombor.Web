import { PaymentRecord } from "models/payment";
import { CreatePayrollRequest, GetPayrollHistoryRequest } from "models/payroll";

import BaseApi from "./BaseApi";
import http from "./http";

class PayrollApi extends BaseApi {
	constructor() {
		super("employees");
	}

	async getHistory(request: GetPayrollHistoryRequest): Promise<PaymentRecord[]> {
		const url = this.buildUrl(request.employeeId);
		const response = await http.get<PaymentRecord[]>(url);

		return response.data;
	}

	/** Create a payroll payment. Immutable (rule 1) — there is no update/delete. */
	async create(request: CreatePayrollRequest): Promise<PaymentRecord> {
		const url = this.buildUrl(request.employeeId);
		const response = await http.post<PaymentRecord>(url, request);

		return response.data;
	}

	private buildUrl(employeeId: number): string {
		return `${this.baseUrl}/${employeeId}/payrolls`;
	}
}

export default new PayrollApi();
