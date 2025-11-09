import { SortOrder } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { withSaving } from "helpers/WithSaving";
import { translate } from "i18n/i18n";
import { makeAutoObservable, runInAction } from "mobx";
import { Employee } from "models/employee";
import { Payment } from "models/payment";
import { CreatePayrollRequest, DeletePayrollRequest, UpdatePayrollRequest } from "models/payroll";
import PayrollApi from "services/api/PayrollApi";
import { IEmployeeStore } from "stores/EmployeeStore";
import { sort } from "utils/sortUtils";

import { NotificationStore } from "./NotificationStore";

export type DialogMode =
	| { kind: "form"; payment?: Payment; employee?: Employee }
	| { kind: "delete"; payment: Payment }
	| { kind: "none" };

export interface IPayrollStore {
	allPayrollPayments: Loadable<Payment[]>;
	filteredPayrollPayments: Loadable<Payment[]>;

	selectedPayment: Payment | null;
	dialogMode: DialogMode;
	isSaving: boolean;

	searchTerm: string;
	filterEmployeeId: number | null;
	selectedEmployee: Employee | null;

	getAll(): Promise<void>;
	create(request: CreatePayrollRequest): Promise<void>;
	update(request: UpdatePayrollRequest): Promise<void>;
	delete(request: DeletePayrollRequest): Promise<void>;

	setSearch(searchTerm: string): void;
	setFilterEmployeeId(employeeId: number | null): void;
	setSort(field: keyof Payment, order: SortOrder): void;

	openCreate(): void;
	openCreateForEmployee(employee: Employee): void;
	openEdit(payment: Payment): void;
	openDelete(payment: Payment): void;
	closeDialog(): void;
}

export class PayrollStore implements IPayrollStore {
	private readonly notificationStore: NotificationStore;
	private readonly employeeStore: IEmployeeStore;

	allPayrollPayments: Loadable<Payment[]> = [];

	searchTerm: string = "";
	filterEmployeeId: number | null = null;
	sortField: keyof Payment | null = null;
	sortOrder: SortOrder = "asc";
	selectedPayment: Payment | null = null;
	dialogMode: DialogMode = { kind: "none" };
	isSaving: boolean = false;

	constructor(notificationStore: NotificationStore, employeeStore: IEmployeeStore) {
		this.notificationStore = notificationStore;
		this.employeeStore = employeeStore;

		makeAutoObservable(this, {}, { autoBind: true });
	}

	get filteredPayrollPayments(): Loadable<Payment[]> {
		if (this.allPayrollPayments === "loading") {
			return "loading";
		}

		let payments = this.allPayrollPayments;

		const searchTerm = this.searchTerm?.trim().toLowerCase();
		if (searchTerm) {
			payments = payments.filter(
				(p) =>
					p.employeeName?.toLowerCase().includes(searchTerm) ||
					p.notes?.toLowerCase().includes(searchTerm),
			);
		}

		if (this.filterEmployeeId !== null) {
			payments = payments.filter((p) => p.employeeId === this.filterEmployeeId);
		}

		if (this.sortField) {
			return this.applySort(payments);
		}

		return [...payments];
	}

	get selectedEmployee(): Employee | null {
		if (!this.filterEmployeeId) {
			return null;
		}

		if (this.employeeStore.allEmployees === "loading") {
			return null;
		}

		return this.employeeStore.allEmployees.find((e) => e.id === this.filterEmployeeId) ?? null;
	}

	async getAll(): Promise<void> {
		if (this.allPayrollPayments === "loading") {
			return;
		}

		const prev = this.allPayrollPayments;
		runInAction(() => (this.allPayrollPayments = "loading"));

		const result = await tryRun(() => PayrollApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(translate("payroll.error.getAll"));
		}

		const data = result.status === "fail" ? prev : result.data;
		runInAction(() => (this.allPayrollPayments = data));
	}

	async create(request: CreatePayrollRequest): Promise<void> {
		const result = await withSaving(this, () => PayrollApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("payroll.error.create"));
			return;
		}

		runInAction(() => {
			if (this.allPayrollPayments !== "loading") {
				this.allPayrollPayments = [result.data, ...this.allPayrollPayments];
			}
		});

		this.closeDialog();
		this.notificationStore.success(translate("payroll.success.create"));
	}

	async update(request: UpdatePayrollRequest): Promise<void> {
		const result = await withSaving(this, () => PayrollApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("payroll.error.update"));
			return;
		}

		runInAction(() => {
			if (this.allPayrollPayments !== "loading") {
				this.allPayrollPayments = this.allPayrollPayments.map((p) =>
					p.id === result.data.id ? result.data : p,
				);
			}
		});

		this.closeDialog();
		this.notificationStore.success(translate("payroll.success.update"));
	}

	async delete(request: DeletePayrollRequest): Promise<void> {
		const result = await withSaving(this, () => PayrollApi.delete(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("payroll.error.delete"));
			return;
		}

		runInAction(() => {
			if (this.allPayrollPayments !== "loading") {
				this.allPayrollPayments = this.allPayrollPayments.filter((p) => p.id !== request.paymentId);
			}
		});

		this.closeDialog();
		this.notificationStore.success(translate("payroll.success.delete"));
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setFilterEmployeeId(employeeId: number | null): void {
		this.filterEmployeeId = employeeId;
	}

	setSort(field: keyof Payment, order: SortOrder): void {
		runInAction(() => {
			this.sortField = field;
			this.sortOrder = order;
		});
	}

	openCreate(): void {
		this.setDialog({ kind: "form" });
	}

	openCreateForEmployee(employee: Employee): void {
		this.setDialog({ kind: "form", employee });
	}

	openEdit(payment: Payment): void {
		this.setDialog({ kind: "form", payment });
	}

	openDelete(payment: Payment): void {
		this.setDialog({ kind: "delete", payment });
	}

	closeDialog(): void {
		this.setDialog({ kind: "none" });
	}

	private setDialog(mode: DialogMode) {
		const payment = "payment" in mode ? (mode.payment ?? null) : null;

		this.dialogMode = mode;
		this.selectedPayment = payment;
	}

	private applySort(data: Loadable<Payment[]>): Loadable<Payment[]> {
		if (data === "loading" || !this.sortField) {
			return data;
		}

		return sort(data, this.sortField, this.sortOrder);
	}
}
