import { LoadSequence } from "helpers/LoadSequence";
import { tryRun } from "helpers/TryRun";
import i18next from "i18n/config";
import { makeAutoObservable, runInAction } from "mobx";
import { MovementSourceRef } from "models/product";
import { StockAdjustment } from "models/stockAdjustment";
import { Transfer } from "models/transfer";
import StockAdjustmentApi from "services/api/StockAdjustmentApi";
import TransferApi from "services/api/TransferApi";

import { NotificationStore } from "./NotificationStore";

export type OpenedMovementSource =
	| { kind: "transfer"; transfer: Transfer }
	| { kind: "adjustment"; adjustment: StockAdjustment };

export interface IMovementSourceStore {
	/** The transfer or adjustment a «Движения» row opened in place; null when none is open. */
	opened: OpenedMovementSource | null;

	/** Loads a transfer / adjustment source and opens its detail modal (transactions are routed). */
	open(source: MovementSourceRef): Promise<void>;
	close(): void;
}

/**
 * Opens the modal-only source documents of stock-movement rows (product and
 * warehouse «Движения») over the page the user is on: a transfer by id, a stock
 * adjustment from the served list (the API has no by-id read for adjustments).
 */
export class MovementSourceStore implements IMovementSourceStore {
	private readonly notificationStore: NotificationStore;
	private readonly loads = new LoadSequence();

	opened: OpenedMovementSource | null = null;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async open(source: MovementSourceRef): Promise<void> {
		const isCurrent = this.loads.begin();

		if (source.sourceType === "Transfer") {
			const result = await tryRun(() => TransferApi.getById(source.sourceId));
			if (!isCurrent()) {
				return;
			}
			if (result.status === "fail") {
				this.notificationStore.notifyApiError(result, "common.movementSource.openFailed");
				return;
			}
			runInAction(() => (this.opened = { kind: "transfer", transfer: result.data }));
			return;
		}

		if (source.sourceType === "StockAdjustment") {
			const result = await tryRun(() => StockAdjustmentApi.getAll());
			if (!isCurrent()) {
				return;
			}
			if (result.status === "fail") {
				this.notificationStore.notifyApiError(result, "common.movementSource.openFailed");
				return;
			}
			const adjustment = result.data.find((a) => a.id === source.sourceId);
			if (!adjustment) {
				this.notificationStore.error(i18next.t("common.movementSource.notFound"));
				return;
			}
			runInAction(() => (this.opened = { kind: "adjustment", adjustment }));
		}
	}

	close(): void {
		this.loads.invalidate();
		this.opened = null;
	}
}

export default MovementSourceStore;
