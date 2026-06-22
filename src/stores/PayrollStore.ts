import { withSaving } from "helpers/WithSaving";
import i18next from "i18n/config";
import { makeAutoObservable } from "mobx";
import { CreatePayrollRequest } from "models/payroll";
import PayrollApi from "services/api/PayrollApi";

import { NotificationStore } from "./NotificationStore";

/**
 * Payroll is an immutable event (rule 1): the only operation is create. The
 * payroll history is read through SelectedEmployeeStore on the employee detail;
 * this store owns the create call + its saving state for the payroll modal.
 */
export interface IPayrollStore {
	isSaving: boolean;
	/** Create a payroll payment; resolves to true on success. */
	create(request: CreatePayrollRequest): Promise<boolean>;
}

export class PayrollStore implements IPayrollStore {
	private readonly notificationStore: NotificationStore;

	isSaving: boolean = false;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
	}

	async create(request: CreatePayrollRequest): Promise<boolean> {
		const result = await withSaving(this, () => PayrollApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("payroll.error.create"));
			return false;
		}

		this.notificationStore.success(i18next.t("payroll.success.create"));
		return true;
	}
}
