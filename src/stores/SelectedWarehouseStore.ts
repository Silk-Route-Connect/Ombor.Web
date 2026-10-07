import { Loadable, toDetailLoadable, toLoadable } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, runInAction } from "mobx";
import { StockReport } from "models/report";
import { Warehouse, WarehouseMovement, WarehouseStockItem } from "models/warehouse";
import ReportApi from "services/api/ReportApi";
import WarehouseApi from "services/api/WarehouseApi";

export interface ISelectedWarehouseStore {
	warehouse: Loadable<Warehouse | null>;
	stock: Loadable<WarehouseStockItem[]>;
	movements: Loadable<WarehouseMovement[]>;
	/**
	 * The served stock report of this warehouse: its `lowStockCount` («Заканчивается»)
	 * and each row's `isLowStock`, the alert the «Остатки» tab shows.
	 */
	stockReport: Loadable<StockReport>;

	load(warehouseId: number): Promise<void>;
	/** Reflect a successful edit / archive / restore / opening stock in place. */
	applyWarehouse(warehouse: Warehouse): void;
	/** Reload the stock + movements ledgers and the stock report (after an opening-stock event). */
	reloadLedgers(warehouseId: number): Promise<void>;
	clear(): void;
}

/**
 * State for the routed warehouse detail page: the open warehouse plus its child
 * collections (the stock view, the movements ledger and the stock report),
 * loaded explicitly by id when the route mounts.
 */
export class SelectedWarehouseStore implements ISelectedWarehouseStore {
	private readonly loads = new LoadSequence();

	warehouse: Loadable<Warehouse | null> = "loading";
	stock: Loadable<WarehouseStockItem[]> = "loading";
	movements: Loadable<WarehouseMovement[]> = "loading";
	stockReport: Loadable<StockReport> = "loading";

	constructor() {
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(warehouseId: number): Promise<void> {
		const isCurrent = this.loads.begin();
		runInAction(() => {
			this.warehouse = "loading";
			this.stock = "loading";
			this.movements = "loading";
			this.stockReport = "loading";
		});

		const [warehouse, stock, movements, stockReport] = await Promise.all([
			tryRun(() => WarehouseApi.getById(warehouseId)),
			tryRun(() => WarehouseApi.getStock(warehouseId)),
			tryRun(() => WarehouseApi.getMovements(warehouseId)),
			tryRun(() => ReportApi.getStock({ warehouseId })),
		]);
		if (!isCurrent()) {
			return;
		}

		runInAction(() => {
			this.warehouse = toDetailLoadable(warehouse);
			this.stock = toLoadable(stock);
			this.movements = toLoadable(movements);
			this.stockReport = toLoadable(stockReport);
		});
	}

	applyWarehouse(warehouse: Warehouse): void {
		this.warehouse = warehouse;
	}

	async reloadLedgers(warehouseId: number): Promise<void> {
		const isCurrent = this.loads.begin();
		const [stock, movements, stockReport] = await Promise.all([
			tryRun(() => WarehouseApi.getStock(warehouseId)),
			tryRun(() => WarehouseApi.getMovements(warehouseId)),
			tryRun(() => ReportApi.getStock({ warehouseId })),
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
			if (stockReport.status === "success") {
				this.stockReport = stockReport.data;
			}
		});
	}

	clear(): void {
		this.loads.invalidate();
		this.warehouse = "loading";
		this.stock = "loading";
		this.movements = "loading";
		this.stockReport = "loading";
	}
}

export default SelectedWarehouseStore;
