import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import i18next from "i18n/config";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import { Employee } from "models/employee";
import { PaymentRecord } from "models/payment";
import PayrollApi from "services/api/PayrollApi";
import { DateFilter, isWithinDateRange, PresetOption } from "utils/dateUtils";

import { IEmployeeStore } from "./EmployeeStore";
import { NotificationStore } from "./NotificationStore";

export interface ISelectedEmployeeStore {
	payrollHistory: Loadable<PaymentRecord[]>;
	filteredPayrollHistory: Loadable<PaymentRecord[]>;
	readonly dateFilter: DateFilter;

	getPayrollHistory(): Promise<void>;
	setPreset(preset: PresetOption): void;
	setCustom(from: Date, to: Date): void;
}

export class SelectedEmployeeStore implements ISelectedEmployeeStore {
	private selectedEmployee: Employee | null = null;
	private readonly employeeStore: IEmployeeStore;
	private readonly notificationStore: NotificationStore;

	payrollHistory: Loadable<PaymentRecord[]> = [];
	dateFilter: DateFilter = { type: "preset", preset: "week" };

	constructor(employeeStore: IEmployeeStore, notificationStore: NotificationStore) {
		this.employeeStore = employeeStore;
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
		this.registerReactions();
	}

	get filteredPayrollHistory(): Loadable<PaymentRecord[]> {
		if (this.payrollHistory === "loading") {
			return "loading";
		}

		return this.payrollHistory.filter((payment) =>
			isWithinDateRange(payment.date, this.dateFilter),
		);
	}

	setPreset(preset: PresetOption): void {
		this.dateFilter = { type: "preset", preset };
	}

	setCustom(from: Date, to: Date): void {
		this.dateFilter = { type: "custom", from, to };
	}

	async getPayrollHistory(): Promise<void> {
		const selectedEmployee = this.selectedEmployee;
		if (this.payrollHistory === "loading" || !selectedEmployee) {
			return;
		}

		runInAction(() => (this.payrollHistory = "loading"));

		const result = await tryRun(() => PayrollApi.getHistory({ employeeId: selectedEmployee.id }));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("payroll.error.getHistory"));
		}

		const data = result.status === "fail" ? [] : result.data;
		runInAction(() => (this.payrollHistory = data));
	}

	private registerReactions() {
		reaction(
			() => this.employeeStore.selectedEmployee,
			(employee) => {
				runInAction(() => {
					this.selectedEmployee = employee;
					this.payrollHistory = [];
					this.dateFilter = { type: "preset", preset: "week" };
				});

				if (employee) {
					this.getPayrollHistory();
				}
			},
			{ fireImmediately: true },
		);
	}
}
