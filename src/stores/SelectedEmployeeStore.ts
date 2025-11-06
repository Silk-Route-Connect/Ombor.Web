import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { translate } from "i18n/i18n";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import { Employee } from "models/employee";
import { Payment } from "models/payment";
import PayrollApi from "services/api/PayrollApi";

import { IEmployeeStore } from "./EmployeeStore";
import { NotificationStore } from "./NotificationStore";

export interface ISelectedEmployeeStore {
	payrollHistory: Loadable<Payment[]>;

	getPayrollHistory(): Promise<void>;
}

export class SelectedEmployeeStore implements ISelectedEmployeeStore {
	private selectedEmployee: Employee | null = null;
	private readonly employeeStore: IEmployeeStore;
	private readonly notificationStore: NotificationStore;

	payrollHistory: Loadable<Payment[]> = [];

	constructor(employeeStore: IEmployeeStore, notificationStore: NotificationStore) {
		this.employeeStore = employeeStore;
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
		this.registerReactions();
	}

	async getPayrollHistory(): Promise<void> {
		if (this.payrollHistory === "loading" || !this.selectedEmployee) {
			return;
		}

		runInAction(() => (this.payrollHistory = "loading"));

		const result = await tryRun(() =>
			PayrollApi.getHistory({ employeeId: this.selectedEmployee!.id }),
		);

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
				});

				if (employee) {
					this.getPayrollHistory();
				}
			},
			{ fireImmediately: true },
		);
	}
}
