import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { translate } from "i18n/i18n";
import { makeAutoObservable, runInAction } from "mobx";
import {
	CreateTransactionRequest,
	TransactionRecord,
	TransactionStatus,
	TransactionType,
} from "models/transaction";
import TransactionApi from "services/api/TransactionApi";

import { NotificationStore } from "./NotificationStore";

export type SortOrder = "asc" | "desc";

export interface ITransactionStore {
	allTransactions: Loadable<TransactionRecord[]>;
	supplies: Loadable<TransactionRecord[]>;
	sales: Loadable<TransactionRecord[]>;
	filteredTransactions: Loadable<TransactionRecord[]>;
	currentTransaction: Loadable<TransactionRecord> | null;

	// client‐side controls
	searchTerm: string;
	filterType?: TransactionType | null;
	filterStatus?: TransactionStatus | null;
	filterPartnerId?: number | null;
	sortField: keyof TransactionRecord | null;
	sortOrder: SortOrder;

	// actions
	getAll(): Promise<void>;
	getById(id: number): Promise<void>;
	create(request: CreateTransactionRequest): Promise<void>;

	// setters for filters & sorting
	setSearchTerm(searchTerm: string): void;
	setFilterType(type?: TransactionType | null): void;
	setFilterStatus(status?: TransactionStatus | null): void;
	setFilterPartner(partnerId?: number | null): void;
	setSort(field: keyof TransactionRecord, order: SortOrder): void;
}

export class TransactionStore implements ITransactionStore {
	private readonly notificationStore: NotificationStore;

	allTransactions: Loadable<TransactionRecord[]> = [];
	currentTransaction: Loadable<TransactionRecord> | null = null;

	searchTerm: string = "";
	filterType?: TransactionType | null = null;
	filterStatus?: TransactionStatus | null = null;
	filterPartnerId?: number | null = null;
	sortField: keyof TransactionRecord | null = null;
	sortOrder: SortOrder = "asc";

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this);
	}

	get filteredTransactions(): Loadable<TransactionRecord[]> {
		if (this.allTransactions === "loading") {
			return "loading";
		}

		let list = this.allTransactions.slice();

		const term = this.searchTerm.trim().toLowerCase();
		if (term) {
			list = list.filter(
				(tx) =>
					tx.partnerName.toLowerCase().includes(term) ||
					(tx.notes ?? "").toLowerCase().includes(term),
			);
		}

		if (this.filterType) {
			list = list.filter((tx) => tx.type === this.filterType);
		}

		if (this.filterStatus) {
			list = list.filter((tx) => tx.status === this.filterStatus);
		}

		if (this.filterPartnerId) {
			list = list.filter((tx) => tx.partnerId === this.filterPartnerId);
		}

		if (this.sortField) {
			const field = this.sortField;
			const orderMultiplier = this.sortOrder === "asc" ? 1 : -1;
			list = list.slice().sort((a, b) => {
				const aValue = a[field];
				const bValue = b[field];

				if (typeof aValue === "string" && typeof bValue === "string") {
					return aValue.localeCompare(bValue) * orderMultiplier;
				}

				if (typeof aValue === "number" && typeof bValue === "number") {
					return (aValue - bValue) * orderMultiplier;
				}

				return 0;
			});
		}

		console.log(`returning filtered transactions: ${list.length}`);
		return list;
	}

	get supplies(): Loadable<TransactionRecord[]> {
		console.log("get supplies");
		if (this.filteredTransactions === "loading") {
			return "loading";
		}

		console.log("returning supplies:" + this.filteredTransactions.length);
		return this.filteredTransactions.filter((el) => el.type === "Supply");
	}

	get sales(): Loadable<TransactionRecord[]> {
		if (this.filteredTransactions === "loading") {
			return "loading";
		}

		return this.filteredTransactions.filter((el) => el.type === "Sale");
	}

	async getAll(): Promise<void> {
		if (this.allTransactions === "loading") {
			return;
		}

		runInAction(() => (this.allTransactions = "loading"));
		const result = await tryRun(() => TransactionApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(translate("transactions.errors.getAll"));
		}

		const data = result.status === "fail" ? [] : result.data;
		console.log(data);
		runInAction(() => (this.allTransactions = data));
		console.log(`all transactions count in get method: ${this.allTransactions.length}`);
	}

	async getById(id: number): Promise<void> {
		if (this.currentTransaction === "loading") {
			return;
		}

		runInAction(() => (this.currentTransaction = "loading"));
		const result = await tryRun(() => TransactionApi.getById(id));

		if (result.status === "fail") {
			this.notificationStore.error(translate("transactions.errors.getById"));
		}

		const data = result.status === "fail" ? null : result.data;
		runInAction(() => (this.currentTransaction = data));
	}

	async create(request: CreateTransactionRequest): Promise<void> {
		const result = await tryRun(() => TransactionApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("transactions.errors.create"));
			return;
		}

		runInAction(() => {
			if (this.allTransactions === "loading") {
				return;
			}

			this.allTransactions = [result.data, ...this.allTransactions];
			this.currentTransaction = result.data;
			this.notificationStore.success("transactions.success.create");
		});
	}

	setSearchTerm(searchTerm: string): void {
		this.searchTerm = searchTerm;
	}

	setFilterType(type?: TransactionType | null): void {
		this.filterType = type;
	}

	setFilterStatus(status?: TransactionStatus | null): void {
		this.filterStatus = status;
	}

	setFilterPartner(partnerId?: number | null): void {
		this.filterPartnerId = partnerId;
	}

	setSort(field: keyof TransactionRecord, order: SortOrder): void {
		this.sortField = field;
		this.sortOrder = order;
	}
}
