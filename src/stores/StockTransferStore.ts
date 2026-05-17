import { SortOrder } from "components/shared/Table/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { withSaving } from "helpers/WithSaving";
import { translate } from "i18n/i18n";
import { makeAutoObservable, runInAction } from "mobx";
import {
	CreateStockTransferRequest,
	GetStockTransfersRequest,
	StockTransfer,
} from "models/stockTransfer";
import StockTransferApi from "services/api/StockTransferApi";

import { NotificationStore } from "./NotificationStore";

export type DialogMode = { kind: "form" } | { kind: "none" };

export interface IStockTransferStore {
	// State
	allTransfers: Loadable<StockTransfer[]>;
	filteredTransfers: Loadable<StockTransfer[]>;
	searchTerm: string;
	sortField: keyof StockTransfer | null;
	sortOrder: SortOrder;
	dialogMode: DialogMode;
	isSaving: boolean;

	// Actions
	getAll(request?: GetStockTransfersRequest): Promise<void>;
	create(request: CreateStockTransferRequest): Promise<void>;

	// Setters
	setSearch(term: string): void;
	setSort(field: keyof StockTransfer, order: SortOrder): void;

	// Dialog helpers
	openCreate(): void;
	closeDialog(): void;
}

export class StockTransferStore implements IStockTransferStore {
	private readonly notificationStore: NotificationStore;

	allTransfers: Loadable<StockTransfer[]> = [];
	searchTerm = "";
	sortField: keyof StockTransfer | null = null;
	sortOrder: SortOrder = "asc";
	dialogMode: DialogMode = { kind: "none" };
	isSaving: boolean = false;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	get filteredTransfers(): Loadable<StockTransfer[]> {
		if (this.allTransfers === "loading") {
			return "loading";
		}

		let transfers = this.allTransfers;
		const searchTerm = this.searchTerm?.toLowerCase();

		if (searchTerm) {
			transfers = transfers.filter(
				(t) =>
					t.fromWarehouseName.toLowerCase().includes(searchTerm) ||
					t.toWarehouseName.toLowerCase().includes(searchTerm) ||
					t.notes?.toLowerCase().includes(searchTerm) ||
					t.userName?.toLowerCase().includes(searchTerm),
			);
		}

		return transfers;
	}

	async getAll(request?: GetStockTransfersRequest): Promise<void> {
		if (this.allTransfers === "loading") {
			return;
		}

		runInAction(() => (this.allTransfers = "loading"));

		const result = await tryRun(() => StockTransferApi.getAll(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("stockTransfer.error.getAll"));
		}

		const data = result.status === "success" ? result.data : [];
		runInAction(() => (this.allTransfers = data));
	}

	async create(request: CreateStockTransferRequest): Promise<void> {
		const result = await withSaving(this, () => StockTransferApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("stockTransfer.error.create"));
			return;
		}

		runInAction(() => {
			if (this.allTransfers !== "loading") {
				this.allTransfers = [result.data, ...this.allTransfers];
			}
		});

		this.closeDialog();
		this.notificationStore.success(translate("stockTransfer.success.create"));
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setSort(field: keyof StockTransfer, order: SortOrder): void {
		this.sortField = field;
		this.sortOrder = order;
	}

	openCreate(): void {
		this.dialogMode = { kind: "form" };
	}

	closeDialog(): void {
		this.dialogMode = { kind: "none" };
	}
}
