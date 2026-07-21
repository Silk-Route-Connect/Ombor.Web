import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import i18next from "i18n/config";
import { makeAutoObservable, runInAction } from "mobx";
import { TransactionRecord } from "models/transaction";
import TransactionApi from "services/api/TransactionApi";

import { NotificationStore } from "./NotificationStore";

export interface ISelectedTransactionStore {
	/** The open transaction (sale / supply / refund), loaded by id for the detail route. */
	transaction: Loadable<TransactionRecord | null>;
	/** Refunds that reference the open transaction (sale/supply detail refund-history). */
	refundsOfCurrent: TransactionRecord[];
	/** The original transaction a refund references (refund detail). */
	originalOfCurrent: TransactionRecord | null;

	load(id: number): Promise<void>;
	clear(): void;
}

/**
 * State for the routed transaction detail page. The open transaction is loaded
 * from the **detail** endpoint (`getById`) — only the rich `TransactionDetailDto`
 * carries `warehouseName`, `payments`, and the transaction `number`; the lean
 * list DTO omits them. The whole collection is loaded alongside to resolve the
 * refund relationships (refund history, and — for a refund — its original) client-
 * side, for which the lean records suffice (docs/mocking.md).
 */
export class SelectedTransactionStore implements ISelectedTransactionStore {
	private readonly notificationStore: NotificationStore;

	/** The open transaction, from the rich detail endpoint. */
	private detail: Loadable<TransactionRecord | null> = "loading";
	/** The full collection, for resolving refund relationships only. */
	private all: Loadable<TransactionRecord[]> = "loading";
	private currentId: number | null = null;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	get transaction(): Loadable<TransactionRecord | null> {
		return this.detail;
	}

	get refundsOfCurrent(): TransactionRecord[] {
		if (this.all === "loading" || this.currentId === null) {
			return [];
		}
		return this.all.filter((t) => t.originalTransactionId === this.currentId);
	}

	get originalOfCurrent(): TransactionRecord | null {
		const current = this.detail;
		if (current === "loading" || !current?.originalTransactionId || this.all === "loading") {
			return null;
		}
		return this.all.find((t) => t.id === current.originalTransactionId) ?? null;
	}

	async load(id: number): Promise<void> {
		runInAction(() => {
			this.currentId = id;
			this.detail = "loading";
			this.all = "loading";
		});

		const [detailResult, allResult] = await Promise.all([
			tryRun(() => TransactionApi.getById(id)),
			tryRun(() => TransactionApi.getAll()),
		]);

		if (detailResult.status === "fail") {
			this.notificationStore.error(i18next.t("transactions.errors.getById"));
		}

		runInAction(() => {
			this.detail = detailResult.status === "success" ? detailResult.data : null;
			this.all = allResult.status === "success" ? allResult.data : [];
		});
	}

	clear(): void {
		this.detail = "loading";
		this.all = "loading";
		this.currentId = null;
	}
}
