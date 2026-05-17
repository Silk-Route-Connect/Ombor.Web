import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { withSaving } from "helpers/WithSaving";
import { translate } from "i18n/i18n";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import { AdjustStockRequest, WarehouseItem, WarehouseMovement } from "models/warehouse";
import WarehouseApi from "services/api/WarehouseApi";
import { DateFilter, DEFAULT_DATE_FILTER, isWithinDateRange, PresetOption } from "utils/dateUtils";

import { NotificationStore } from "./NotificationStore";
import { IWarehouseStore } from "./WarehouseStore";

export interface ISelectedWarehouseStore {
	// State
	movements: Loadable<WarehouseMovement[]>;
	isSaving: boolean;
	dateFilter: DateFilter;

	// Computed
	items: WarehouseItem[];

	// Actions
	getMovements(warehouseId: number): Promise<void>;
	adjustStock(request: AdjustStockRequest): Promise<void>;
	setPreset(preset: PresetOption): void;
	setCustom(from: Date, to: Date): void;
}

export class SelectedWarehouseStore implements ISelectedWarehouseStore {
	private readonly warehouseStore: IWarehouseStore;
	private readonly notificationStore: NotificationStore;

	private allMovements: Loadable<WarehouseMovement[]> = [];
	isSaving: boolean = false;
	dateFilter: DateFilter = DEFAULT_DATE_FILTER;

	constructor(warehouseStore: IWarehouseStore, notificationStore: NotificationStore) {
		this.warehouseStore = warehouseStore;
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
		this.registerReactions();
	}

	get items(): WarehouseItem[] {
		return this.warehouseStore.selectedWarehouse?.items ?? [];
	}

	get movements(): Loadable<WarehouseMovement[]> {
		if (this.allMovements === "loading") {
			return "loading";
		}

		return this.allMovements.filter((movement) =>
			isWithinDateRange(movement.createdAt, this.dateFilter),
		);
	}

	setPreset(preset: PresetOption): void {
		this.dateFilter = { type: "preset", preset };
	}

	setCustom(from: Date, to: Date): void {
		this.dateFilter = { type: "custom", from, to };
	}

	async getMovements(warehouseId: number): Promise<void> {
		if (this.allMovements === "loading") {
			return;
		}

		runInAction(() => (this.allMovements = "loading"));

		const result = await tryRun(() => WarehouseApi.getMovements({ warehouseId }));

		if (result.status === "fail") {
			this.notificationStore.error(translate("warehouse.error.getMovements"));
		}

		const data = result.status === "fail" ? [] : result.data;
		runInAction(() => (this.allMovements = data));
	}

	async adjustStock(request: AdjustStockRequest): Promise<void> {
		const warehouse = this.warehouseStore.selectedWarehouse;
		if (!warehouse) {
			return;
		}

		const result = await withSaving(this, () => WarehouseApi.adjustStock(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("warehouse.error.adjustStock"));
			return;
		}

		this.warehouseStore.closeDialog();
		this.notificationStore.success(translate("warehouse.success.adjustStock"));
	}

	private registerReactions() {
		reaction(
			() => this.warehouseStore.selectedWarehouse,
			(warehouse) => {
				runInAction(() => {
					this.allMovements = [];
					this.dateFilter = DEFAULT_DATE_FILTER;
				});

				if (warehouse) {
					this.getMovements(warehouse.id);
				}
			},
			{ fireImmediately: true },
		);
	}
}
