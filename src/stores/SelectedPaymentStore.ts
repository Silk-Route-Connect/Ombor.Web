import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import i18next from "i18n/config";
import { makeAutoObservable, runInAction } from "mobx";
import { PaymentRecord } from "models/payment";
import PaymentApi from "services/api/PaymentApi";

import { NotificationStore } from "./NotificationStore";

export interface ISelectedPaymentStore {
	payment: Loadable<PaymentRecord | null>;
	load(paymentId: number): Promise<void>;
	clear(): void;
}

/** State for the routed payment detail page — the open payment loaded by id. */
export class SelectedPaymentStore implements ISelectedPaymentStore {
	private readonly notificationStore: NotificationStore;

	payment: Loadable<PaymentRecord | null> = "loading";

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(paymentId: number): Promise<void> {
		runInAction(() => (this.payment = "loading"));

		const result = await tryRun(() => PaymentApi.getById(paymentId));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("payment.error.getById"));
		}

		runInAction(() => {
			this.payment = result.status === "success" ? result.data : null;
		});
	}

	clear(): void {
		this.payment = "loading";
	}
}

export default SelectedPaymentStore;
