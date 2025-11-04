import { SortOrder } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { withSaving } from "helpers/WithSaving";
import { translate } from "i18n/i18n";
import { makeAutoObservable, runInAction } from "mobx";
import {
	CreateEmployeeRequest,
	Employee,
	EmployeeStatus,
	GetEmployeeByIdRequest,
	UpdateEmployeeRequest,
} from "models/employee";
import EmployeeApi from "services/api/EmployeeApi";

import { NotificationStore } from "./NotificationStore";

export type DialogMode =
	| { kind: "form"; employee?: Employee }
	| { kind: "delete"; employee: Employee }
	| { kind: "details"; employee: Employee }
	| { kind: "payment"; employee: Employee }
	| { kind: "none" };

export interface IEmployeeStore {
	// computed properties
	allEmployees: Loadable<Employee[]>;
	filteredEmployees: Loadable<Employee[]>;

	// UI state
	selectedEmployee: Employee | null;
	dialogMode: DialogMode;
	isSaving: boolean;

	// filters
	searchTerm: string;
	filterStatus: EmployeeStatus | null;

	// actions
	getAll(): Promise<void>;
	getById(employeeId: number): Promise<void>;
	create(request: CreateEmployeeRequest): Promise<void>;
	update(request: UpdateEmployeeRequest): Promise<void>;
	delete(employeeId: number): Promise<void>;

	// setters for filters & sorting
	setSearch(searchTerm: string): void;
	setFilterStatus(status: EmployeeStatus | null): void;
	setSort(field: keyof Employee, order: SortOrder): void;
	setSelectedEmployee(employee: Employee | null): void;

	// UI dialog helper methods
	openCreate(): void;
	openEdit(employee: Employee): void;
	openDelete(employee: Employee): void;
	openDetails(employee: Employee): void;
	openPayment(employee: Employee): void;
	closeDialog(): void;
}

export class EmployeeStore implements IEmployeeStore {
	private readonly notificationStore: NotificationStore;

	allEmployees: Loadable<Employee[]> = [];

	searchTerm: string = "";
	filterStatus: EmployeeStatus | null = null;
	sortField: keyof Employee | null = null;
	sortOrder: SortOrder = "asc";
	selectedEmployee: Employee | null = null;
	dialogMode: DialogMode = { kind: "none" };
	isSaving: boolean = false;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
	}

	get filteredEmployees(): Loadable<Employee[]> {
		if (this.allEmployees === "loading") {
			return "loading";
		}

		let employees = this.allEmployees;

		const searchTerm = this.searchTerm?.trim().toLowerCase();
		if (searchTerm) {
			employees = employees.filter(
				(el) =>
					el.fullName.toLowerCase().includes(searchTerm) ||
					el.position.toLowerCase().includes(searchTerm),
			);
		}

		if (this.filterStatus) {
			employees = employees.filter((el) => el.status === this.filterStatus);
		}

		return [...employees];
	}

	async getAll() {
		if (this.allEmployees === "loading") {
			return;
		}

		runInAction(() => (this.allEmployees = "loading"));

		const result = await tryRun(() => EmployeeApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(translate("employees.error.getAll"));
		}

		const data = result.status === "fail" ? [] : result.data;
		runInAction(() => (this.allEmployees = data));
	}

	async getById(employeeId: number): Promise<void> {
		const request: GetEmployeeByIdRequest = { id: employeeId };
		const result = await tryRun(() => EmployeeApi.getById(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("employees.error.getById"));
		}

		const data = result.status === "fail" ? null : result.data;
		runInAction(() => (this.selectedEmployee = data));
	}

	async create(request: CreateEmployeeRequest): Promise<void> {
		const result = await withSaving(this, () => EmployeeApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("employees.error.create"));
			return;
		}

		if (this.allEmployees !== "loading") {
			this.allEmployees = [result.data, ...this.allEmployees];
		}

		this.closeDialog();
		this.notificationStore.success(translate("employees.success.create"));
	}

	async update(request: UpdateEmployeeRequest): Promise<void> {
		const result = await withSaving(this, () => EmployeeApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("employees.error.update"));
			return;
		}

		runInAction(() => {
			if (this.allEmployees !== "loading") {
				this.allEmployees = this.allEmployees.map((el) =>
					el.id === result.data.id ? result.data : el,
				);
			}
		});

		this.closeDialog();
		this.notificationStore.success(translate("employees.success.update"));
	}

	async delete(employeeId: number): Promise<void> {
		const result = await withSaving(this, () => EmployeeApi.delete(employeeId));

		if (result.status === "fail") {
			this.notificationStore.error(translate("employees.error.delete"));
			return;
		}

		runInAction(() => {
			if (this.allEmployees !== "loading") {
				this.allEmployees = this.allEmployees.filter((el) => el.id !== employeeId);
			}
		});

		this.closeDialog();
		this.notificationStore.success(translate("employees.success.delete"));
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setFilterStatus(status: EmployeeStatus | null): void {
		this.filterStatus = status;
	}

	setSelectedEmployee(employee: Employee | null): void {
		this.selectedEmployee = employee;
	}

	setSort(field: keyof Employee, order: SortOrder): void {
		runInAction(() => {
			this.sortField = field;
			this.sortOrder = order;
		});
	}

	openCreate(): void {
		this.setDialog({ kind: "form" });
	}

	openEdit(employee: Employee): void {
		this.setDialog({ kind: "form", employee: employee });
	}

	openDelete(employee: Employee): void {
		this.setDialog({ kind: "delete", employee: employee });
	}

	openDetails(employee: Employee): void {
		this.setDialog({ kind: "details", employee: employee });
	}

	openPayment(employee: Employee): void {
		this.setDialog({ kind: "payment", employee: employee });
	}

	closeDialog(): void {
		this.setDialog({ kind: "none" });
	}

	private setDialog(mode: DialogMode) {
		const employee = "employee" in mode ? (mode.employee ?? null) : null;

		this.dialogMode = mode;
		this.selectedEmployee = employee;
	}
}
