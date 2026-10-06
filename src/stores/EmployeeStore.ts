import { SortOrder } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import { isReady, Loadable, LoadOptions, toLoadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { withSaving } from "helpers/WithSaving";
import i18next from "i18n/config";
import { makeAutoObservable, runInAction } from "mobx";
import {
	CreateEmployeeRequest,
	Employee,
	EmployeeStatus,
	EmployeeWriteResponse,
	UpdateEmployeeRequest,
} from "models/employee";
import EmployeeApi from "services/api/EmployeeApi";
import { parseApiError } from "utils/apiError";
import { sort } from "utils/sortUtils";

import { NotificationStore } from "./NotificationStore";

export type DialogMode =
	| { kind: "form"; employee?: Employee }
	| { kind: "delete"; employee: Employee }
	| { kind: "details"; employee: Employee }
	| { kind: "payment"; employee: Employee }
	| { kind: "terminate"; employee: Employee }
	| { kind: "restore"; employee: Employee }
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
	getAll(options?: LoadOptions): Promise<void>;
	create(request: CreateEmployeeRequest): Promise<void>;
	update(request: UpdateEmployeeRequest): Promise<void>;
	/** Hard delete of a never-paid employee; true when it was deleted. */
	delete(employee: Employee): Promise<boolean>;
	/** Set status to Terminated («Уволить») — a status change, not a hard delete. */
	terminate(employee: Employee): Promise<void>;
	/** Set status back to Active («Восстановить»). */
	restore(employee: Employee): Promise<void>;
	/** A salary was just paid: the employee can no longer be deleted. */
	markPaid(employeeId: number): void;

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
	openTerminate(employee: Employee): void;
	openRestore(employee: Employee): void;
	closeDialog(): void;
}

export class EmployeeStore implements IEmployeeStore {
	private readonly notificationStore: NotificationStore;

	allEmployees: Loadable<Employee[]> = "loading";

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
		if (!isReady(this.allEmployees)) {
			return this.allEmployees;
		}

		let employees = this.allEmployees;

		const searchTerm = this.searchTerm?.trim().toLowerCase();
		if (searchTerm) {
			employees = employees.filter(
				(el) =>
					el.name.toLowerCase().includes(searchTerm) ||
					el.position.toLowerCase().includes(searchTerm),
			);
		}

		if (this.filterStatus) {
			employees = employees.filter((el) => el.status === this.filterStatus);
		}

		if (this.sortField) {
			return this.applySort(employees);
		}

		return [...employees];
	}

	async getAll(options?: LoadOptions): Promise<void> {
		runInAction(() => (this.allEmployees = "loading"));

		const result = await tryRun(() => EmployeeApi.getAll());

		if (result.status === "fail" && !options?.quiet) {
			this.notificationStore.notifyLoadError(result, "employees.error.getAll");
		}

		runInAction(() => (this.allEmployees = toLoadable(result)));
	}

	async create(request: CreateEmployeeRequest): Promise<void> {
		const result = await withSaving(this, () => EmployeeApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "employees.error.create");
			return;
		}

		if (isReady(this.allEmployees)) {
			// A new employee has no payroll yet, so it can still be deleted.
			this.allEmployees = [{ ...result.data, isDeletable: true }, ...this.allEmployees];
		}

		this.closeDialog();
		this.notificationStore.success(i18next.t("employees.success.create"));
	}

	async update(request: UpdateEmployeeRequest): Promise<void> {
		const result = await withSaving(this, () => EmployeeApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "employees.error.update");
			return;
		}

		this.applyWrite(result.data);
		this.closeDialog();
		this.notificationStore.success(i18next.t("employees.success.update"));
	}

	async delete(employee: Employee): Promise<boolean> {
		const result = await withSaving(this, () => EmployeeApi.delete(employee.id));

		if (result.status === "fail") {
			// Paid since the list loaded: employees have no archive, so the reason
			// points to the «Уволен» status, and the row stops offering «Удалить».
			this.notificationStore.notifyApiError(
				result,
				"employees.error.delete",
				{ name: employee.name },
				{ "entity.referenced": "employee.delete.referenced" },
			);
			if (parseApiError(result.cause).code === "entity.referenced") {
				this.patchEmployee(employee.id, { isDeletable: false });
				this.closeDialog();
			}
			return false;
		}

		runInAction(() => {
			if (isReady(this.allEmployees)) {
				this.allEmployees = this.allEmployees.filter((el) => el.id !== employee.id);
			}
		});

		this.closeDialog();
		this.notificationStore.success(i18next.t("employees.success.delete", { name: employee.name }));
		return true;
	}

	async terminate(employee: Employee): Promise<void> {
		await this.setStatus(employee, "Terminated", i18next.t("employee.success.terminate"));
	}

	async restore(employee: Employee): Promise<void> {
		await this.setStatus(employee, "Active", i18next.t("employee.success.restore"));
	}

	private async setStatus(
		employee: Employee,
		status: EmployeeStatus,
		successMessage: string,
	): Promise<void> {
		const request: UpdateEmployeeRequest = {
			id: employee.id,
			name: employee.name,
			position: employee.position,
			salary: employee.salary,
			status,
			dateOfEmployment: employee.dateOfEmployment,
			contactInfo: employee.contactInfo,
		};
		const result = await withSaving(this, () => EmployeeApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "employees.error.update");
			return;
		}

		this.applyWrite(result.data);
		this.closeDialog();
		this.notificationStore.success(successMessage);
	}

	markPaid(employeeId: number): void {
		this.patchEmployee(employeeId, { isDeletable: false });
	}

	/** A create / update answer carries no `isDeletable` — the record keeps the one it had. */
	private applyWrite(data: EmployeeWriteResponse): void {
		this.patchEmployee(data.id, data);
	}

	private patchEmployee(id: number, patch: Partial<Employee>): void {
		runInAction(() => {
			if (isReady(this.allEmployees)) {
				this.allEmployees = this.allEmployees.map((el) =>
					el.id === id ? { ...el, ...patch } : el,
				);
			}
			if (this.selectedEmployee?.id === id) {
				this.selectedEmployee = { ...this.selectedEmployee, ...patch };
			}
		});
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
		this.selectedEmployee = null;
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

	openTerminate(employee: Employee): void {
		this.setDialog({ kind: "terminate", employee: employee });
	}

	openRestore(employee: Employee): void {
		this.setDialog({ kind: "restore", employee: employee });
	}

	closeDialog(): void {
		this.setDialog({ kind: "none" });
	}

	private setDialog(mode: DialogMode) {
		this.dialogMode = mode;

		// A dialog that targets an employee focuses it; closing a dialog (or an
		// employee-less «create» mode) must NOT clear the focused employee — on the
		// detail page that employee is the page subject, and wiping it drops the page
		// into a permanent loader. openCreate clears it explicitly for a blank form.
		if ("employee" in mode && mode.employee) {
			this.selectedEmployee = mode.employee;
		}
	}

	private applySort(data: Loadable<Employee[]>): Loadable<Employee[]> {
		if (!isReady(data) || !this.sortField) {
			return data;
		}

		return sort(data, this.sortField, this.sortOrder);
	}
}
