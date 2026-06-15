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
 * State for the routed transaction detail page. Loads the whole collection once
 * (the v1 list serves full records incl. lines + payments) and resolves the open
 * transaction, its refund history, and — for a refund — its original, all
 * client-side (docs/mocking.md).
 */
export class SelectedTransactionStore implements ISelectedTransactionStore {
	private readonly notificationStore: NotificationStore;

	private all: Loadable<TransactionRecord[]> = "loading";
	private currentId: number | null = null;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	get transaction(): Loadable<TransactionRecord | null> {
		if (this.all === "loading") {
			return "loading";
		}
		return this.all.find((t) => t.id === this.currentId) ?? null;
	}

	get refundsOfCurrent(): TransactionRecord[] {
		if (this.all === "loading" || this.currentId === null) {
			return [];
		}
		return this.all.filter((t) => t.originalTransactionId === this.currentId);
	}

	get originalOfCurrent(): TransactionRecord | null {
		const current = this.transaction;
		if (current === "loading" || !current?.originalTransactionId || this.all === "loading") {
			return null;
		}
		return this.all.find((t) => t.id === current.originalTransactionId) ?? null;
	}

	async load(id: number): Promise<void> {
		runInAction(() => {
			this.currentId = id;
			this.all = "loading";
		});

		const result = await tryRun(() => TransactionApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("transactions.errors.getById"));
		}

		runInAction(() => (this.all = result.status === "success" ? result.data : []));
	}

	clear(): void {
		this.all = "loading";
		this.currentId = null;
	}
}
