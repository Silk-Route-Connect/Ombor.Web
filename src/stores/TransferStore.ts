import { isReady, toLoadable } from "helpers/Loading";
import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";

import { Loadable, tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
import { CreateTransferRequest, Transfer } from "../models/transfer";
import TransferApi from "../services/api/TransferApi";
import { analytics } from "../services/telemetry";
import { NotificationStore } from "./NotificationStore";

export type TransferDialogMode =
	| { kind: "create" }
	| { kind: "detail"; transfer: Transfer }
	| { kind: "none" };

export interface ITransferStore {
	allTransfers: Loadable<Transfer[]>;
	filteredTransfers: Loadable<Transfer[]>;

	/** Filter by a warehouse appearing as source OR destination. */
	warehouseFilter: number | null;
	isSaving: boolean;
	dialogMode: TransferDialogMode;

	getAll(): Promise<void>;
	create(request: CreateTransferRequest): Promise<Transfer | null>;

	setWarehouseFilter(warehouseId: number | null): void;

	openCreate(): void;
	openDetail(transfer: Transfer): void;
	closeDialog(): void;
}

export class TransferStore implements ITransferStore {
	private readonly notificationStore: NotificationStore;

	allTransfers: Loadable<Transfer[]> = "loading";
	warehouseFilter: number | null = null;
	isSaving = false;
	dialogMode: TransferDialogMode = { kind: "none" };

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	get filteredTransfers(): Loadable<Transfer[]> {
		if (!isReady(this.allTransfers)) {
			return this.allTransfers;
		}

		if (this.warehouseFilter == null) {
			return this.allTransfers;
		}

		return this.allTransfers.filter(
			(t) => t.fromWarehouseId === this.warehouseFilter || t.toWarehouseId === this.warehouseFilter,
		);
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

	openCreate(): void {
		this.dialogMode = { kind: "create" };
	}

	openDetail(transfer: Transfer): void {
		this.dialogMode = { kind: "detail", transfer };
	}

	closeDialog(): void {
		this.dialogMode = { kind: "none" };
	}
}

export default TransferStore;
