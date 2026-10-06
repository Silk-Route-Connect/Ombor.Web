import {
	CreateEmployeeRequest,
	Employee,
	EmployeeWriteResponse,
	GetEmployeeByIdRequest,
	GetEmployeesRequest,
	UpdateEmployeeRequest,
} from "models/employee";

import BaseApi from "./BaseApi";
import http from "./http";

class EmployeeApi extends BaseApi {
	constructor() {
		super("employees");
	}

	async getAll(request?: GetEmployeesRequest | null): Promise<Employee[]> {
		const url = this.getUrl(request);
		const response = await http.get<Employee[]>(url);

		return response.data;
	}

	async getById(request: GetEmployeeByIdRequest): Promise<Employee> {
		const url = this.getUrlWithId(request.id);
		const response = await http.get<Employee>(url);

		return response.data;
	}

	async create(request: CreateEmployeeRequest): Promise<EmployeeWriteResponse> {
		const response = await http.post<EmployeeWriteResponse>(this.baseUrl, request);

		return response.data;
	}

	async update(request: UpdateEmployeeRequest): Promise<EmployeeWriteResponse> {
		const url = this.getUrlWithId(request.id);
		const response = await http.put<EmployeeWriteResponse>(url, request);

		return response.data;
	}

	/** Hard-delete — allowed only while no payroll names the employee (409 `entity.referenced` otherwise). */
	async delete(id: number): Promise<void> {
		const url = this.getUrlWithId(id);
		await http.delete(url);
	}
}

export default new EmployeeApi();
