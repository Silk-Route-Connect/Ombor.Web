import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { translate } from "i18n/i18n";
import { IReactionDisposer, makeAutoObservable, reaction, runInAction } from "mobx";
import { TransactionPayment } from "models/payment";
import { TransactionLine } from "models/transaction";
import TransactionApi from "services/api/TransactionApi";

import { NotificationStore } from "./NotificationStore";
import { ITransactionStore } from "./TransactionStore";

export interface ISelectedTransactionStore {
	allLines: Loadable<TransactionLine[]>;
	payments: Loadable<TransactionPayment[]>;

	getLines(): Promise<void>;
	getPayments(): Promise<void>;
}

export class SelectedTransactionStore implements ISelectedTransactionStore {
	private readonly notificationStore: NotificationStore;
	private readonly transactionStore: ITransactionStore;
	private transactionId: number | null = null;

	allLines: Loadable<TransactionLine[]> = [];
	payments: Loadable<TransactionPayment[]> = [];

	constructor(notificationStore: NotificationStore, transactionStore: ITransactionStore) {
		this.notificationStore = notificationStore;
		this.transactionStore = transactionStore;

		this.registerReactions();

		makeAutoObservable(this);
	}

	async getLines(): Promise<void> {
		const transactionId = this.transactionId;
		if (!transactionId) {
			return;
		}

		if (this.allLines === "loading") {
			return;
		}

		const result = await tryRun(() => TransactionApi.getLines(transactionId));

		if (result.status === "fail") {
			this.notificationStore.error(translate("transactions.error.loadLines"));
		}

		const data = result.status === "success" ? result.data : [];
		runInAction(() => (this.allLines = data));
	}

	async getPayments(): Promise<void> {
		const transactionId = this.transactionId;
		if (!transactionId) {
			return;
		}

		if (this.payments === "loading") {
			return;
		}

		const result = await tryRun(() => TransactionApi.getPayments(transactionId));

		if (result.status === "fail") {
			this.notificationStore.error(translate("transactions.error.loadPayments"));
		}

		const data = result.status === "success" ? result.data : [];
		runInAction(() => (this.payments = data));
	}

	private cleanupPreviousTransactionData(): void {
		runInAction(() => {
			this.allLines = [];
			this.payments = [];
		});
	}

	private registerReactions(): IReactionDisposer {
		return reaction(
			() => this.transactionStore.currentTransaction,
			(transaction) => {
				if (!transaction) {
					this.cleanupPreviousTransactionData();
					return;
				}

				if (transaction === "loading") {
					return;
				}

				runInAction(() => (this.transactionId = transaction.id));
				this.getPayments();
			},
		);
	}
}
