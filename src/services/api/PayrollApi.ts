import { Payment } from "models/payment";
import { CreatePayrollRequest } from "models/payroll";

import BaseApi from "./BaseApi";
import http from "./http";

class PayrollApi extends BaseApi {
	constructor() {
		super("employees");
	}

	async createPayroll(
		employeeId: number,
		request: Omit<CreatePayrollRequest, "employeeId">,
	): Promise<Payment> {
		const url = `${this.baseUrl}/${employeeId}/payroll`;
		const response = await http.post<Payment>(url, request);

		return response.data;
	}

	async getPayrollHistory(employeeId: number): Promise<Payment[]> {
		const url = `${this.baseUrl}/${employeeId}/payroll`;
		const response = await http.get<Payment[]>(url);

		return response.data;
	}
}

export default new PayrollApi();
