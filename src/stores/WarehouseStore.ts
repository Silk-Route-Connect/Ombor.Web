import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";
import { matchesSearch } from "utils/stringUtils";

import { Loadable, tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
import {
	AddOpeningStockRequest,
	CreateWarehouseRequest,
	UpdateWarehouseRequest,
	Warehouse,
} from "../models/warehouse";
import WarehouseApi from "../services/api/WarehouseApi";
import { NotificationStore } from "./NotificationStore";

export type WarehouseDialogMode =
	| { kind: "form"; warehouse?: Warehouse }
	| { kind: "archive"; warehouse: Warehouse }
	| { kind: "restore"; warehouse: Warehouse }
	| { kind: "opening"; warehouse: Warehouse }
	| { kind: "none" };

/** Aggregate totals across the currently shown warehouses (the list total row). */
export type WarehouseTotals = {
	productCount: number;
	totalUnits: number;
	stockValue: number;
};

export interface IWarehouseStore {
	allWarehouses: Loadable<Warehouse[]>;
	filteredWarehouses: Loadable<Warehouse[]>;
	totals: WarehouseTotals;
	archivedCount: number;

	searchTerm: string;
	showArchived: boolean;
	isSaving: boolean;
	dialogMode: WarehouseDialogMode;

	getAll(): Promise<void>;
	create(request: CreateWarehouseRequest): Promise<void>;
	update(request: UpdateWarehouseRequest): Promise<Warehouse | null>;
	archive(warehouse: Warehouse): Promise<Warehouse | null>;
	restore(warehouse: Warehouse): Promise<Warehouse | null>;
	addOpeningStock(warehouseId: number, request: AddOpeningStockRequest): Promise<Warehouse | null>;

	setSearch(term: string): void;
	setShowArchived(show: boolean): void;

	openCreate(): void;
	openEdit(warehouse: Warehouse): void;
	openArchive(warehouse: Warehouse): void;
	openRestore(warehouse: Warehouse): void;
	openOpeningStock(warehouse: Warehouse): void;
	closeDialog(): void;
}

export class WarehouseStore implements IWarehouseStore {
	private readonly notificationStore: NotificationStore;

	allWarehouses: Loadable<Warehouse[]> = "loading";
	searchTerm = "";
	showArchived = false;
	isSaving = false;
	dialogMode: WarehouseDialogMode = { kind: "none" };

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	/** Total archived warehouses — drives the «Архив» toggle badge (unfiltered). */
	get archivedCount(): number {
		if (this.allWarehouses === "loading") {
			return 0;
		}
		return this.allWarehouses.filter((w) => w.isArchived).length;
	}

	get filteredWarehouses(): Loadable<Warehouse[]> {
		if (this.allWarehouses === "loading") {
			return "loading";
		}

		let warehouses = this.allWarehouses;

		if (!this.showArchived) {
			warehouses = warehouses.filter((w) => !w.isArchived);
		}

		if (this.searchTerm.trim()) {
			warehouses = warehouses.filter(
				(w) => matchesSearch(w.name, this.searchTerm) || matchesSearch(w.location, this.searchTerm),
			);
		}

		return warehouses;
	}

	/** Totals over the shown rows (archived included when the toggle is on). */
	get totals(): WarehouseTotals {
		const rows = this.filteredWarehouses;
		if (rows === "loading") {
			return { productCount: 0, totalUnits: 0, stockValue: 0 };
		}
		return rows.reduce(
			(acc, w) => ({
				productCount: acc.productCount + w.productCount,
				totalUnits: acc.totalUnits + w.totalUnits,
				stockValue: acc.stockValue + w.stockValue,
			}),
			{ productCount: 0, totalUnits: 0, stockValue: 0 },
		);
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.allWarehouses = "loading"));

		const result = await tryRun(() => WarehouseApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("warehouse.error.getAll"));
		}

		runInAction(() => (this.allWarehouses = result.status === "success" ? result.data : []));
	}

	async create(request: CreateWarehouseRequest): Promise<void> {
		const result = await withSaving(this, () => WarehouseApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("warehouse.error.create"));
			return;
		}

		runInAction(() => {
			if (this.allWarehouses !== "loading") {
				this.allWarehouses = [...this.allWarehouses, result.data];
			}
		});

		this.closeDialog();
		this.notificationStore.success(
			i18next.t("warehouse.success.create", { name: result.data.name }),
		);
	}

	async update(request: UpdateWarehouseRequest): Promise<Warehouse | null> {
		const result = await withSaving(this, () => WarehouseApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("warehouse.error.update"));
			return null;
		}

		this.replaceWarehouse(result.data);
		this.closeDialog();
		this.notificationStore.success(i18next.t("warehouse.success.update"));
		return result.data;
	}

	async archive(warehouse: Warehouse): Promise<Warehouse | null> {
		const result = await withSaving(this, () => WarehouseApi.archive(warehouse.id));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("warehouse.error.archive"));
			return null;
		}

		this.replaceWarehouse(result.data);
		this.closeDialog();
		this.notificationStore.success(
			i18next.t("warehouse.success.archive", { name: warehouse.name }),
		);
		return result.data;
	}

	async restore(warehouse: Warehouse): Promise<Warehouse | null> {
		const result = await withSaving(this, () => WarehouseApi.restore(warehouse.id));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("warehouse.error.restore"));
			return null;
		}

		this.replaceWarehouse(result.data);
		this.closeDialog();
		this.notificationStore.success(
			i18next.t("warehouse.success.restore", { name: warehouse.name }),
		);
		return result.data;
	}

	async addOpeningStock(
		warehouseId: number,
		request: AddOpeningStockRequest,
	): Promise<Warehouse | null> {
		const result = await withSaving(this, () => WarehouseApi.addOpeningStock(warehouseId, request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("warehouse.error.openingStock"));
			return null;
		}

		this.replaceWarehouse(result.data);
		this.closeDialog();
		this.notificationStore.success(i18next.t("warehouse.success.openingStock"));
		return result.data;
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setShowArchived(show: boolean): void {
		this.showArchived = show;
	}

	openCreate(): void {
		this.dialogMode = { kind: "form" };
	}

	openEdit(warehouse: Warehouse): void {
		this.dialogMode = { kind: "form", warehouse };
	}

	openArchive(warehouse: Warehouse): void {
		this.dialogMode = { kind: "archive", warehouse };
	}

	openRestore(warehouse: Warehouse): void {
		this.dialogMode = { kind: "restore", warehouse };
	}

	openOpeningStock(warehouse: Warehouse): void {
		this.dialogMode = { kind: "opening", warehouse };
	}

	closeDialog(): void {
		this.dialogMode = { kind: "none" };
	}

	private replaceWarehouse(updated: Warehouse): void {
		runInAction(() => {
			if (this.allWarehouses !== "loading") {
				this.allWarehouses = this.allWarehouses.map((w) => (w.id === updated.id ? updated : w));
			}
		});
	}
}

export default WarehouseStore;
