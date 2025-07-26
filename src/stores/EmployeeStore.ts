import { Loadable } from "helpers/Loading";
import {
	CreateEmployeeRequest,
	Employee,
	GetEmployeesRequest,
	UpdateEmployeeRequest,
} from "./../models/employee";
import { SortOrder } from "components/shared/DataTable/DataTable";
import { NotificationStore } from "./NotificationStore";
import { makeAutoObservable, runInAction } from "mobx";
import EmployeeApi from "services/api/EmployeeApi";
import { tryRun } from "helpers/TryRun";
import { translate } from "i18n/i18n";

export interface IEmployeeStore {
	allEmployees: Loadable<Employee[]>;
	filteredEmployees: Loadable<Employee[]>;
	selectedEmployee: Employee | null;
	searchTerm: string;
	sortField: keyof Employee | null;
	sortOrder: SortOrder;

	// actions
	getAll(request?: GetEmployeesRequest): Promise<void>;
	createEmployee(request: CreateEmployeeRequest): Promise<void>;
	updateEmployee(request: UpdateEmployeeRequest): Promise<void>;
	deleteEmployee(id: number): Promise<void>;

	// setters for filters & sorting
	setSearch(term: string): void;
	setSelectedEmployee(id: number): void;
	setSort(field: keyof Employee, order: SortOrder): void;
}

export class EmployeeStore implements IEmployeeStore {
	allEmployees: Loadable<Employee[]> = [];
	selectedEmployee: Employee | null = null;
	searchTerm = "";
	sortField: keyof Employee | null = null;
	sortOrder: SortOrder = "asc";

	private readonly notificationStore: NotificationStore;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this);
	}

	get filteredEmployees(): Loadable<Employee[]> {
		if (this.allEmployees === "loading") {
			return "loading";
		}

		let employees = this.allEmployees;
		const searchTerm = this.searchTerm.toLocaleLowerCase();

		if (searchTerm) {
			employees = employees.filter(
				(emp) =>
					emp.fullName.toLowerCase().includes(searchTerm) ||
					emp.role.toLowerCase().includes(searchTerm),
			);
		}

		return employees;
	}

	async getAll(request?: GetEmployeesRequest | null): Promise<void> {
		if (this.allEmployees === "loading") {
			return;
		}

		runInAction(() => (this.allEmployees = "loading"));

		const result = await tryRun(() => EmployeeApi.getAll(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("employees.errors.getAll"));
		}

		const data = result.status === "success" ? result.data : [];

		runInAction(() => (this.allEmployees = data));
	}

	async createEmployee(requset: CreateEmployeeRequest): Promise<void> {
		const result = await tryRun(() => EmployeeApi.create(requset));

		if (result.status === "fail") {
			this.notificationStore.error(translate("employees.errors.create"));
			return;
		}

		if (this.allEmployees === "loading") {
			return;
		}

		runInAction(() => {
			this.notificationStore.error(translate("employees.success.create"));

			if (this.allEmployees !== "loading") {
				this.allEmployees = [result.data, ...this.allEmployees];
			}
		});
	}

	async updateEmployee(request: UpdateEmployeeRequest): Promise<void> {
		const result = await tryRun(() => EmployeeApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("employees.errors.update"));
			return;
		}

		runInAction(() => {
			this.notificationStore.error(translate("employees.success.update"));

			if (this.allEmployees !== "loading") {
				const index = this.allEmployees.findIndex((s) => s.id === request.id);
				if (index !== -1) {
					this.allEmployees[index] = result.data;
				}
			}
		});
	}

	async deleteEmployee(id: number): Promise<void> {
		const result = await tryRun(() => EmployeeApi.delete(id));

		if (result.status === "fail") {
			this.notificationStore.error(translate("employees.errors.delete"));
			return;
		}

		runInAction(() => {
			this.notificationStore.error(translate("employees.success.delete"));

			if (this.allEmployees !== "loading") {
				this.allEmployees = this.allEmployees.filter((s) => s.id !== id);
			}
		});
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setSelectedEmployee(id: number): void {
		if (this.allEmployees === "loading") {
			return;
		}

		const employee = this.allEmployees.find((e) => e.id === id);

		if (employee) {
			runInAction(() => (this.selectedEmployee = employee));
		}
	}

	setSort(field: keyof Employee, order: SortOrder): void {
		runInAction(() => {
			this.sortField = field;
			this.sortOrder = order;
		});
	}
}
