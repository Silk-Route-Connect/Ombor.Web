import { Payment } from "models/payment";
import {
	CreatePayrollRequest,
	DeletePayrollRequest,
	GetPayrollByIdRequest,
	GetPayrollHistoryRequest,
	UpdatePayrollRequest,
} from "models/payroll";

import BaseApi from "./BaseApi";
import http from "./http";

class PayrollApi extends BaseApi {
	constructor() {
		super("employees");
	}

	async getAll(): Promise<Payment[]> {
		const response = await http.get<Payment[]>("api/payments?PaymentType=Payroll");

		return response.data;
	}

	async getHistory(request: GetPayrollHistoryRequest): Promise<Payment[]> {
		const url = this.buildUrl(request.employeeId);
		const response = await http.get<Payment[]>(url);

		return response.data;
	}

	async getById(request: GetPayrollByIdRequest): Promise<Payment> {
		const url = this.buildUrl(request.employeeId, request.paymentId);
		const response = await http.get<Payment>(url);

		return response.data;
	}

	async create(request: CreatePayrollRequest): Promise<Payment> {
		const url = this.buildUrl(request.employeeId);
		const response = await http.post<Payment>(url, request);

		return response.data;
	}

	async update(request: UpdatePayrollRequest): Promise<Payment> {
		const { employeeId, paymentId, ...payload } = request;
		const url = this.buildUrl(employeeId, paymentId);
		const response = await http.put<Payment>(url, payload);

		return response.data;
	}

	async delete(request: DeletePayrollRequest): Promise<void> {
		const url = this.buildUrl(request.employeeId, request.paymentId);
		await http.delete(url);
	}

	private buildUrl(employeeId: number, paymentId?: number): string {
		return paymentId
			? `${this.baseUrl}/${employeeId}/payrolls/${paymentId}`
			: `${this.baseUrl}/${employeeId}/payrolls`;
	}
}

export default new PayrollApi();
