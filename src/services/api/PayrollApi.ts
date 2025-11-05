import { Payment } from "models/payment";
import { UpdatePayrollRequest } from "models/payroll";

import BaseApi from "./BaseApi";
import http from "./http";

class PayrollApi extends BaseApi {
	constructor() {
		super("employees");
	}

	async create(employeeId: number, request: UpdatePayrollRequest): Promise<Payment> {
		const url = `${this.baseUrl}/${employeeId}/payroll`;
		const response = await http.post<Payment>(url, request);
		return response.data;
	}

	async update(
		employeeId: number,
		paymentId: number,
		request: UpdatePayrollRequest,
	): Promise<Payment> {
		const url = `${this.baseUrl}/${employeeId}/payroll/${paymentId}`;
		const response = await http.put<Payment>(url, request);
		return response.data;
	}

	async delete(employeeId: number, paymentId: number): Promise<void> {
		const url = `${this.baseUrl}/${employeeId}/payroll/${paymentId}`;
		await http.delete(url);
	}

	async getHistory(employeeId: number): Promise<Payment[]> {
		const url = `${this.baseUrl}/${employeeId}/payroll`;
		const response = await http.get<Payment[]>(url);
		return response.data;
	}

	async getAll(): Promise<Payment[]> {
		const response = await http.get<Payment[]>("api/payments?PaymentType=Payroll");
		return response.data;
	}
}

export default new PayrollApi();
