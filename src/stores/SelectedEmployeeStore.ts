import { isReady, Loadable, toDetailLoadable, toLoadable } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import { Employee } from "models/employee";
import { PaymentRecord } from "models/payment";
import EmployeeApi from "services/api/EmployeeApi";
import PayrollApi from "services/api/PayrollApi";
import { DateFilter, isWithinDateRange, PresetOption } from "utils/dateUtils";

import { IEmployeeStore } from "./EmployeeStore";

export interface ISelectedEmployeeStore {
	/** The employee-detail route's subject: loading, failed, `null` when it does not exist. */
	employee: Loadable<Employee | null>;
	payrollHistory: Loadable<PaymentRecord[]>;
	filteredPayrollHistory: Loadable<PaymentRecord[]>;
	readonly dateFilter: DateFilter;

	load(employeeId: number): Promise<void>;
	clear(): void;
	getPayrollHistory(): Promise<void>;
	setPreset(preset: PresetOption): void;
	setCustom(from: Date, to: Date): void;
}

/**
 * State for the routed employee detail page. The loaded employee is also set as
 * `employeeStore.selectedEmployee`, which the edit / payroll dialogs target and
 * which edits update in place; the payroll history follows that employee.
 */
export class SelectedEmployeeStore implements ISelectedEmployeeStore {
	private selectedEmployee: Employee | null = null;
	private readonly employeeStore: IEmployeeStore;
	private readonly employeeLoads = new LoadSequence();
	private readonly historyLoads = new LoadSequence();

	employee: Loadable<Employee | null> = "loading";
	payrollHistory: Loadable<PaymentRecord[]> = "loading";
	// «Весь период» by default so the payouts counted in the section badge are visible
	// on arrival — a week/month window hid the only payout (live-ui-27).
	dateFilter: DateFilter = { type: "preset", preset: "alltime" };

	constructor(employeeStore: IEmployeeStore) {
		this.employeeStore = employeeStore;

		makeAutoObservable(this, {}, { autoBind: true });
		this.registerReactions();
	}

	get filteredPayrollHistory(): Loadable<PaymentRecord[]> {
		if (!isReady(this.payrollHistory)) {
			return this.payrollHistory;
		}

		return this.payrollHistory.filter((payment) =>
			isWithinDateRange(payment.date, this.dateFilter),
		);
	}

	async load(employeeId: number): Promise<void> {
		const isCurrent = this.employeeLoads.begin();
		runInAction(() => (this.employee = "loading"));
		// No lingering subject while the new one loads — the dialogs must not target it.
		this.employeeStore.setSelectedEmployee(null);

		const result = await tryRun(() => EmployeeApi.getById({ id: employeeId }));
		if (!isCurrent()) {
			return;
		}

		runInAction(() => (this.employee = toDetailLoadable(result)));
		if (result.status === "success") {
			this.employeeStore.setSelectedEmployee(result.data);
		}
	}

	clear(): void {
		this.employeeLoads.invalidate();
		this.employee = "loading";
		this.employeeStore.setSelectedEmployee(null);
	}

	setPreset(preset: PresetOption): void {
		this.dateFilter = { type: "preset", preset };
	}

	setCustom(from: Date, to: Date): void {
		this.dateFilter = { type: "custom", from, to };
	}

	/** Always refetches (e.g. right after a payroll) — a superseded response is dropped. */
	async getPayrollHistory(): Promise<void> {
		const selectedEmployee = this.selectedEmployee;
		if (!selectedEmployee) {
			return;
		}

		const isCurrent = this.historyLoads.begin();
		runInAction(() => (this.payrollHistory = "loading"));

		const result = await tryRun(() => PayrollApi.getHistory({ employeeId: selectedEmployee.id }));
		if (!isCurrent()) {
			return;
		}

		runInAction(() => (this.payrollHistory = toLoadable(result)));
	}

	private registerReactions() {
		reaction(
			() => this.employeeStore.selectedEmployee?.id,
			() => {
				const employee = this.employeeStore.selectedEmployee;
				this.historyLoads.invalidate();
				runInAction(() => {
					this.selectedEmployee = employee;
					this.payrollHistory = "loading";
					this.dateFilter = { type: "preset", preset: "alltime" };
				});

				if (employee) {
					void this.getPayrollHistory();
				}
			},
			{ fireImmediately: true },
		);
	}
}
