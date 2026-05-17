import { SortOrder } from "components/shared/Table/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { withSaving } from "helpers/WithSaving";
import { translate } from "i18n/i18n";
import { makeAutoObservable, runInAction } from "mobx";
import {
	CreateWarehouseRequest,
	GetWarehousesRequest,
	UpdateWarehouseRequest,
	Warehouse,
} from "models/warehouse";
import WarehouseApi from "services/api/WarehouseApi";

import { NotificationStore } from "./NotificationStore";

export type DialogMode =
	| { kind: "form"; warehouse?: Warehouse }
	| { kind: "delete"; warehouse: Warehouse }
	| { kind: "adjustStock"; warehouse: Warehouse }
	| { kind: "transfer"; warehouse: Warehouse }
	| { kind: "none" };

export interface IWarehouseStore {
	// State
	allWarehouses: Loadable<Warehouse[]>;
	filteredWarehouses: Loadable<Warehouse[]>;
	selectedWarehouse: Warehouse | null;
	searchTerm: string;
	sortField: keyof Warehouse | null;
	sortOrder: SortOrder;
	dialogMode: DialogMode;
	isSaving: boolean;

	// Actions
	getAll(request?: GetWarehousesRequest): Promise<void>;
	create(request: CreateWarehouseRequest): Promise<void>;
	update(request: UpdateWarehouseRequest): Promise<void>;
	delete(warehouseId: number): Promise<void>;

	// Setters
	setSearch(term: string): void;
	setSort(field: keyof Warehouse, order: SortOrder): void;
	setSelectedWarehouse(warehouse: Warehouse | null): void;

	// Dialog helpers
	openCreate(): void;
	openEdit(warehouse: Warehouse): void;
	openDelete(warehouse: Warehouse): void;
	openAdjustStock(warehouse: Warehouse): void;
	openTransfer(warehouse: Warehouse): void;
	openDetails(warehouse: Warehouse): void;
	closeDialog(): void;
}

export class WarehouseStore implements IWarehouseStore {
	private readonly notificationStore: NotificationStore;

	allWarehouses: Loadable<Warehouse[]> = [];
	selectedWarehouse: Warehouse | null = null;
	searchTerm = "";
	sortField: keyof Warehouse | null = null;
	sortOrder: SortOrder = "asc";
	dialogMode: DialogMode = { kind: "none" };
	isSaving: boolean = false;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	get filteredWarehouses(): Loadable<Warehouse[]> {
		if (this.allWarehouses === "loading") {
			return "loading";
		}

		let warehouses = this.allWarehouses;
		const searchTerm = this.searchTerm?.toLowerCase();

		if (searchTerm) {
			warehouses = warehouses.filter(
				(w) =>
					w.name.toLowerCase().includes(searchTerm) ||
					w.location?.toLowerCase().includes(searchTerm),
			);
		}

		return warehouses;
	}

	async getAll(request?: GetWarehousesRequest): Promise<void> {
		if (this.allWarehouses === "loading") {
			return;
		}

		runInAction(() => (this.allWarehouses = "loading"));

		const result = await tryRun(() => WarehouseApi.getAll(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("warehouse.error.getAll"));
		}

		const data = result.status === "success" ? result.data : [];
		runInAction(() => (this.allWarehouses = data));
	}

	async create(request: CreateWarehouseRequest): Promise<void> {
		const result = await withSaving(this, () => WarehouseApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("warehouse.error.create"));
			return;
		}

		runInAction(() => {
			if (this.allWarehouses !== "loading") {
				this.allWarehouses = [result.data, ...this.allWarehouses];
			}
		});

		this.closeDialog();
		this.notificationStore.success(translate("warehouse.success.create"));
	}

	async update(request: UpdateWarehouseRequest): Promise<void> {
		const result = await withSaving(this, () => WarehouseApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("warehouse.error.update"));
			return;
		}

		runInAction(() => {
			if (this.allWarehouses !== "loading") {
				this.allWarehouses = this.allWarehouses.map((w) =>
					w.id === result.data.id ? result.data : w,
				);
			}
		});

		this.closeDialog();
		this.notificationStore.success(translate("warehouse.success.update"));
	}

	async delete(id: number): Promise<void> {
		const result = await withSaving(this, () => WarehouseApi.delete(id));

		if (result.status === "fail") {
			this.notificationStore.error(translate("warehouse.error.delete"));
			return;
		}

		runInAction(() => {
			if (this.allWarehouses !== "loading") {
				this.allWarehouses = this.allWarehouses.filter((w) => w.id !== id);
			}
		});

		this.closeDialog();
		this.notificationStore.success(translate("warehouse.success.delete"));
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setSort(field: keyof Warehouse, order: SortOrder): void {
		this.sortField = field;
		this.sortOrder = order;
	}

	setSelectedWarehouse(warehouse: Warehouse | null): void {
		this.selectedWarehouse = warehouse;
	}

	openCreate(): void {
		this.setDialog({ kind: "form" });
	}

	openEdit(warehouse: Warehouse): void {
		this.setDialog({ kind: "form", warehouse });
	}

	openDelete(warehouse: Warehouse): void {
		this.setDialog({ kind: "delete", warehouse });
	}

	openAdjustStock(warehouse: Warehouse): void {
		this.setDialog({ kind: "adjustStock", warehouse });
	}

	openTransfer(warehouse: Warehouse): void {
		this.setDialog({ kind: "transfer", warehouse });
	}

	openDetails(warehouse: Warehouse): void {
		this.selectedWarehouse = warehouse;
		// Side pane opens automatically via this assignment
	}

	closeDialog(): void {
		this.setDialog({ kind: "none" });
	}

	private setDialog(mode: DialogMode) {
		this.dialogMode = mode;

		// Don't change selectedWarehouse for dialogs (side pane stays open)
		// Only details mode explicitly sets selectedWarehouse
	}
}
