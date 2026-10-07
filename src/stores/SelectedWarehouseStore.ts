import { isPresent, isReady, Loadable, toDetailLoadable, toLoadable } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { tryRun } from "helpers/TryRun";
import { withSaving } from "helpers/WithSaving";
import i18next from "i18n/config";
import { makeAutoObservable, runInAction } from "mobx";
import { Warehouse, WarehouseMovement, WarehouseStockItem } from "models/warehouse";
import WarehouseApi from "services/api/WarehouseApi";
import { formatQuantity } from "utils/formatCurrency";
import { measurementShort } from "utils/productUtils";

import { NotificationStore } from "./NotificationStore";

export interface ISelectedWarehouseStore {
	warehouse: Loadable<Warehouse | null>;
	stock: Loadable<WarehouseStockItem[]>;
	movements: Loadable<WarehouseMovement[]>;
	/** The stock row whose «Порог» dialog is open; null while closed. */
	thresholdRow: WarehouseStockItem | null;
	/** A threshold save is in flight. */
	isSaving: boolean;

	load(warehouseId: number): Promise<void>;
	/** Reflect a successful edit / archive / restore / opening stock in place. */
	applyWarehouse(warehouse: Warehouse): void;
	/** Reload the stock + movements ledgers (after an opening-stock event, an archive or a restore). */
	reloadLedgers(warehouseId: number): Promise<void>;
	openThreshold(row: WarehouseStockItem): void;
	closeThreshold(): void;
	/**
	 * Set (a number) or clear (null) the open row's threshold. On success the row
	 * (with its recomputed flag) and the warehouse's served «Заканчивается» count
	 * refresh in place and the dialog closes; false on a failure (toasted).
	 */
	saveThreshold(value: number | null): Promise<boolean>;
	clear(): void;
}

/**
 * State for the routed warehouse detail page: the open warehouse (with its
 * served «Заканчивается» count) plus its child collections — the stock rows
 * (each with its served threshold and flag) and the movements ledger — loaded
 * explicitly by id when the route mounts.
 */
export class SelectedWarehouseStore implements ISelectedWarehouseStore {
	private readonly loads = new LoadSequence();
	private readonly notificationStore: NotificationStore;

	warehouse: Loadable<Warehouse | null> = "loading";
	stock: Loadable<WarehouseStockItem[]> = "loading";
	movements: Loadable<WarehouseMovement[]> = "loading";
	thresholdRow: WarehouseStockItem | null = null;
	isSaving = false;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(warehouseId: number): Promise<void> {
		const isCurrent = this.loads.begin();
		runInAction(() => {
			this.warehouse = "loading";
			this.stock = "loading";
			this.movements = "loading";
		});

		const [warehouse, stock, movements] = await Promise.all([
			tryRun(() => WarehouseApi.getById(warehouseId)),
			tryRun(() => WarehouseApi.getStock(warehouseId)),
			tryRun(() => WarehouseApi.getMovements(warehouseId)),
		]);
		if (!isCurrent()) {
			return;
		}

		runInAction(() => {
			this.warehouse = toDetailLoadable(warehouse);
			this.stock = toLoadable(stock);
			this.movements = toLoadable(movements);
		});
	}

	applyWarehouse(warehouse: Warehouse): void {
		this.warehouse = warehouse;
	}

	async reloadLedgers(warehouseId: number): Promise<void> {
		const isCurrent = this.loads.begin();
		const [stock, movements] = await Promise.all([
			tryRun(() => WarehouseApi.getStock(warehouseId)),
			tryRun(() => WarehouseApi.getMovements(warehouseId)),
		]);
		if (!isCurrent()) {
			return;
		}

		runInAction(() => {
			if (stock.status === "success") {
				this.stock = stock.data;
			}
			if (movements.status === "success") {
				this.movements = movements.data;
			}
		});
	}

	openThreshold(row: WarehouseStockItem): void {
		this.thresholdRow = row;
	}

	closeThreshold(): void {
		this.thresholdRow = null;
	}

	async saveThreshold(value: number | null): Promise<boolean> {
		const row = this.thresholdRow;
		const warehouse = this.warehouse;
		if (!row || !isPresent(warehouse)) {
			return false;
		}

		const result = await withSaving(this, () =>
			WarehouseApi.setLowStockThreshold(warehouse.id, row.productId, { lowStockThreshold: value }),
		);
		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "warehouse.error.threshold");
			return false;
		}

		// The KPI reads the warehouse's served `lowStockCount`, never a count of the rows here.
		const refreshed = await tryRun(() => WarehouseApi.getById(warehouse.id));
		runInAction(() => {
			const updated = result.data;
			if (isReady(this.stock)) {
				this.stock = this.stock.map((r) => (r.productId === updated.productId ? updated : r));
			}
			if (refreshed.status === "success" && isPresent(this.warehouse)) {
				if (this.warehouse.id === refreshed.data.id) {
					this.warehouse = refreshed.data;
				}
			}
			this.thresholdRow = null;
		});

		const unit = measurementShort(i18next.t, row.measurement);
		this.notificationStore.success(
			value === null
				? i18next.t("warehouse.success.thresholdCleared", { name: row.productName })
				: i18next.t("warehouse.success.threshold", {
						name: row.productName,
						threshold: `${formatQuantity(value)} ${unit}`.trim(),
					}),
		);
		return true;
	}

	clear(): void {
		this.loads.invalidate();
		this.thresholdRow = null;
		this.warehouse = "loading";
		this.stock = "loading";
		this.movements = "loading";
	}
}

export default SelectedWarehouseStore;
