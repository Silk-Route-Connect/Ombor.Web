import { isReady, toLoadable } from "helpers/Loading";
import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";
import { ALL_DATES, DateRangeValue, filterByDateRange, isDateRangeActive } from "utils/dateRange";
import { matchesSearch } from "utils/stringUtils";

import { Loadable, tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
import { CreateTransferRequest, Transfer } from "../models/transfer";
import TransferApi from "../services/api/TransferApi";
import { analytics } from "../services/telemetry";
import { NotificationStore } from "./NotificationStore";

export type TransferDialogMode = { kind: "create" } | { kind: "none" };

export interface ITransferStore {
	allTransfers: Loadable<Transfer[]>;
	filteredTransfers: Loadable<Transfer[]>;

	/** Filter by a warehouse appearing as source OR destination. */
	warehouseFilter: number | null;
	searchTerm: string;
	dateRange: DateRangeValue;
	isFiltering: boolean;
	isSaving: boolean;
	dialogMode: TransferDialogMode;

	getAll(): Promise<void>;
	/** The transfer `/transfers/:id` names, from the loaded list; null = not found. */
	findById(id: number | null): Loadable<Transfer | null>;
	create(request: CreateTransferRequest): Promise<Transfer | null>;

	setWarehouseFilter(warehouseId: number | null): void;
	setSearch(term: string): void;
	setDateRange(range: DateRangeValue): void;

	openCreate(): void;
	closeDialog(): void;
}

export class TransferStore implements ITransferStore {
	private readonly notificationStore: NotificationStore;

	allTransfers: Loadable<Transfer[]> = "loading";
	warehouseFilter: number | null = null;
	searchTerm = "";
	dateRange: DateRangeValue = ALL_DATES;
	isSaving = false;
	dialogMode: TransferDialogMode = { kind: "none" };

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	/** Whether search, the warehouse filter or the period narrows the list. */
	get isFiltering(): boolean {
		return (
			this.warehouseFilter != null ||
			this.searchTerm.trim() !== "" ||
			isDateRangeActive(this.dateRange)
		);
	}

	/** Period + warehouse (source OR destination) + search over both warehouses and the author. */
	get filteredTransfers(): Loadable<Transfer[]> {
		if (!isReady(this.allTransfers)) {
			return this.allTransfers;
		}

		let rows = filterByDateRange(this.allTransfers, this.dateRange, (tr) => tr.date);

		if (this.warehouseFilter != null) {
			rows = rows.filter(
				(tr) =>
					tr.fromWarehouseId === this.warehouseFilter || tr.toWarehouseId === this.warehouseFilter,
			);
		}

		const term = this.searchTerm.trim();
		if (term) {
			rows = rows.filter((tr) =>
				matchesSearch([tr.fromWarehouseName, tr.toWarehouseName, tr.createdBy].join(" "), term),
			);
		}

		return rows;
	}

	// The list page holds every transfer (lines included), so the detail needs no extra read.
	findById(id: number | null): Loadable<Transfer | null> {
		if (id === null) {
			return null;
		}
		if (!isReady(this.allTransfers)) {
			return this.allTransfers;
		}
		return this.allTransfers.find((tr) => tr.id === id) ?? null;
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.allTransfers = "loading"));

		const result = await tryRun(() => TransferApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.notifyLoadError(result, "transfer.error.getAll");
		}

		runInAction(() => (this.allTransfers = toLoadable(result)));
	}

	async create(request: CreateTransferRequest): Promise<Transfer | null> {
		const result = await withSaving(this, () => TransferApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "transfer.error.create");
			return null;
		}

		runInAction(() => {
			if (isReady(this.allTransfers)) {
				this.allTransfers = [result.data, ...this.allTransfers];
			}
		});

		this.closeDialog();
		this.notificationStore.success(
			i18next.t("transfer.success.create", {
				from: result.data.fromWarehouseName,
				to: result.data.toWarehouseName,
				positions: result.data.lines.length,
			}),
		);
		analytics.capture("stock_transfer_created", { line_count: result.data.lines.length });
		return result.data;
	}

	setWarehouseFilter(warehouseId: number | null): void {
		this.warehouseFilter = warehouseId;
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setDateRange(range: DateRangeValue): void {
		this.dateRange = range;
	}

	openCreate(): void {
		this.dialogMode = { kind: "create" };
	}

	closeDialog(): void {
		this.dialogMode = { kind: "none" };
	}
}

export default TransferStore;
