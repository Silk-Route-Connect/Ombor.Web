import {
	CreateEmployeeRequest,
	Employee,
	UpdateEmployeeRequest,
	GetEmployeesRequest,
} from "./../../models/employee";
import BaseApi from "./BaseApi";
import http from "./http";
import { promises } from "dns";
import exp from "constants";

class EmployeeApi extends BaseApi {
	constructor() {
		super("employees");
	}

	async getAll(request?: GetEmployeesRequest | null): Promise<Employee[]> {
		const url = this.getUrl(request);
		const response = await http.get<Employee[]>(url);

		return response.data;
	}

	async getById(id: number): Promise<Employee> {
		const url = this.getUrlWithId(id);
		const response = await http.get<Employee>(url);

		return response.data;
	}

	async create(request: CreateEmployeeRequest): Promise<Employee> {
		const url = this.getUrl();
		const response = await http.post<Employee>(url, request);

		return response.data;
	}

	async update(request: UpdateEmployeeRequest): Promise<Employee> {
		const url = this.getUrlWithId(request.id);
		const response = await http.put(url, request);

		return response.data;
	}

	async delete(id: number): Promise<void> {
		const url = this.getUrlWithId(id);
		await http.delete(url);
	}
}

export default new EmployeeApi();
