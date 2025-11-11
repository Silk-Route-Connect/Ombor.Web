import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { translate } from "i18n/i18n";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import { Employee } from "models/employee";
import { Payment } from "models/payment";
import PayrollApi from "services/api/PayrollApi";
import { DateFilter, isWithinDateRange, PresetOption } from "utils/dateUtils";

import { IEmployeeStore } from "./EmployeeStore";
import { NotificationStore } from "./NotificationStore";

export interface ISelectedEmployeeStore {
	payrollHistory: Loadable<Payment[]>;
	filteredPayrollHistory: Loadable<Payment[]>;
	readonly dateFilter: DateFilter;

	getPayrollHistory(): Promise<void>;
	setPreset(preset: PresetOption): void;
	setCustom(from: Date, to: Date): void;
}

export class SelectedEmployeeStore implements ISelectedEmployeeStore {
	private selectedEmployee: Employee | null = null;
	private readonly employeeStore: IEmployeeStore;
	private readonly notificationStore: NotificationStore;

	payrollHistory: Loadable<Payment[]> = [];
	dateFilter: DateFilter = { type: "preset", preset: "week" };

	constructor(employeeStore: IEmployeeStore, notificationStore: NotificationStore) {
		this.employeeStore = employeeStore;
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
		this.registerReactions();
	}

	get filteredPayrollHistory(): Loadable<Payment[]> {
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
			this.notificationStore.error(translate("payroll.error.getHistory"));
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
