import {
	isLoadError,
	isReady,
	Loadable,
	LoadError,
	toDetailLoadable,
	toLoadable,
} from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { tryRun } from "helpers/TryRun";
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
	/** Set when the collection behind the refund relationships failed to load. */
	relationsError: LoadError | null;

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
	private readonly loads = new LoadSequence();

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
		if (!isReady(this.all) || this.currentId === null) {
			return [];
		}
		return this.all.filter((t) => t.originalTransactionId === this.currentId);
	}

	get originalOfCurrent(): TransactionRecord | null {
		const current = this.detail;
		if (!isReady(current) || !current?.originalTransactionId || !isReady(this.all)) {
			return null;
		}
		return this.all.find((t) => t.id === current.originalTransactionId) ?? null;
	}

	get relationsError(): LoadError | null {
		return isLoadError(this.all) ? this.all : null;
	}

	async load(id: number): Promise<void> {
		const isCurrent = this.loads.begin();
		runInAction(() => {
			this.currentId = id;
			this.detail = "loading";
			this.all = "loading";
		});

		const [detailResult, allResult] = await Promise.all([
			tryRun(() => TransactionApi.getById(id)),
			tryRun(() => TransactionApi.getAll()),
		]);
		if (!isCurrent()) {
			return;
		}

		if (detailResult.status === "fail") {
			this.notificationStore.notifyLoadError(detailResult, "transactions.errors.getById");
		}

		runInAction(() => {
			this.detail = toDetailLoadable(detailResult);
			this.all = toLoadable(allResult);
		});
	}

	clear(): void {
		this.loads.invalidate();
		this.detail = "loading";
		this.all = "loading";
		this.currentId = null;
	}
}
