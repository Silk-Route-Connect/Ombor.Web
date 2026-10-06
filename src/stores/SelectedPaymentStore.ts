import { Loadable, toDetailLoadable } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, runInAction } from "mobx";
import { PaymentRecord } from "models/payment";
import PaymentApi from "services/api/PaymentApi";

export interface ISelectedPaymentStore {
	payment: Loadable<PaymentRecord | null>;
	load(paymentId: number): Promise<void>;
	clear(): void;
}

/** State for the routed payment detail page — the open payment loaded by id. */
export class SelectedPaymentStore implements ISelectedPaymentStore {
	private readonly loads = new LoadSequence();

	payment: Loadable<PaymentRecord | null> = "loading";

	constructor() {
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(paymentId: number): Promise<void> {
		const isCurrent = this.loads.begin();
		runInAction(() => (this.payment = "loading"));

		const result = await tryRun(() => PaymentApi.getById(paymentId));
		if (!isCurrent()) {
			return;
		}

		runInAction(() => (this.payment = toDetailLoadable(result)));
	}

	clear(): void {
		this.loads.invalidate();
		this.payment = "loading";
	}
}

export default SelectedPaymentStore;
