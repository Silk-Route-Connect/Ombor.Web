import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import i18next from "i18n/config";
import { makeAutoObservable, runInAction } from "mobx";
import { Warehouse, WarehouseMovement, WarehouseStockItem } from "models/warehouse";
import WarehouseApi from "services/api/WarehouseApi";

import { NotificationStore } from "./NotificationStore";

export interface ISelectedWarehouseStore {
	warehouse: Loadable<Warehouse | null>;
	stock: Loadable<WarehouseStockItem[]>;
	movements: Loadable<WarehouseMovement[]>;

	load(warehouseId: number): Promise<void>;
	/** Reflect a successful edit / archive / restore / opening stock in place. */
	applyWarehouse(warehouse: Warehouse): void;
	/** Reload the stock + movements ledgers (after an opening-stock event). */
	reloadLedgers(warehouseId: number): Promise<void>;
	clear(): void;
}

/**
 * State for the routed warehouse detail page: the open warehouse plus its child
 * collections (the stock view and the movements ledger), loaded explicitly by
 * id when the route mounts.
 */
export class SelectedWarehouseStore implements ISelectedWarehouseStore {
	private readonly notificationStore: NotificationStore;

	warehouse: Loadable<Warehouse | null> = "loading";
	stock: Loadable<WarehouseStockItem[]> = "loading";
	movements: Loadable<WarehouseMovement[]> = "loading";

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(warehouseId: number): Promise<void> {
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

		if (warehouse.status === "fail") {
			this.notificationStore.error(i18next.t("warehouse.error.getById"));
		} else if (stock.status === "fail" || movements.status === "fail") {
			this.notificationStore.error(i18next.t("warehouse.error.getStock"));
		}

		runInAction(() => {
			this.warehouse = warehouse.status === "success" ? warehouse.data : null;
			this.stock = stock.status === "success" ? stock.data : [];
			this.movements = movements.status === "success" ? movements.data : [];
		});
	}

	applyWarehouse(warehouse: Warehouse): void {
		this.warehouse = warehouse;
	}

	async reloadLedgers(warehouseId: number): Promise<void> {
		const [stock, movements] = await Promise.all([
			tryRun(() => WarehouseApi.getStock(warehouseId)),
			tryRun(() => WarehouseApi.getMovements(warehouseId)),
		]);

		runInAction(() => {
			if (stock.status === "success") {
				this.stock = stock.data;
			}
			if (movements.status === "success") {
				this.movements = movements.data;
			}
		});
	}

	clear(): void {
		this.warehouse = "loading";
		this.stock = "loading";
		this.movements = "loading";
	}
}

export default SelectedWarehouseStore;
