import { isReady, LoadOptions, toLoadable } from "helpers/Loading";
import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";
import { StockReport } from "models/report";
import ReportApi from "services/api/ReportApi";
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
import { ReportLoadOptions, ReportResource } from "./ReportResource";

export type WarehouseDialogMode =
	| { kind: "form"; warehouse?: Warehouse }
	| { kind: "archive"; warehouse: Warehouse }
	| { kind: "restore"; warehouse: Warehouse }
	| { kind: "delete"; warehouse: Warehouse }
	| { kind: "cannotDelete"; warehouse: Warehouse }
	| { kind: "opening"; warehouse: Warehouse }
	| { kind: "none" };

export interface IWarehouseStore {
	allWarehouses: Loadable<Warehouse[]>;
	filteredWarehouses: Loadable<Warehouse[]>;
	activeWarehouses: Loadable<Warehouse[]>;
	/** Today's stock report over every warehouse — the list strip's served totals. */
	stockReport: ReportResource<StockReport>;
	archivedCount: number;

	searchTerm: string;
	showArchived: boolean;
	isSaving: boolean;
	dialogMode: WarehouseDialogMode;

	getAll(options?: LoadOptions): Promise<void>;
	loadStockReport(options?: ReportLoadOptions): Promise<void>;
	create(request: CreateWarehouseRequest): Promise<void>;
	update(request: UpdateWarehouseRequest): Promise<Warehouse | null>;
	archive(warehouse: Warehouse): Promise<Warehouse | null>;
	restore(warehouse: Warehouse): Promise<Warehouse | null>;
	remove(warehouse: Warehouse): Promise<boolean>;
	addOpeningStock(warehouseId: number, request: AddOpeningStockRequest): Promise<Warehouse | null>;

	setSearch(term: string): void;
	setShowArchived(show: boolean): void;

	openCreate(): void;
	openEdit(warehouse: Warehouse): void;
	openArchive(warehouse: Warehouse): void;
	openRestore(warehouse: Warehouse): void;
	openDelete(warehouse: Warehouse): void;
	openCannotDelete(warehouse: Warehouse): void;
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
	readonly stockReport = new ReportResource<StockReport>();

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	/** Total archived warehouses — drives the «Архив» toggle badge (unfiltered). */
	get archivedCount(): number {
		if (!isReady(this.allWarehouses)) {
			return 0;
		}
		return this.allWarehouses.filter((w) => w.isArchived).length;
	}

	/**
	 * Every non-archived warehouse, independent of the list page's archive toggle
	 * and search — the source for pickers (POS, orders), so a filter left on
	 * «Склады» never hides or mis-defaults the stock location (ux-6).
	 */
	get activeWarehouses(): Loadable<Warehouse[]> {
		if (!isReady(this.allWarehouses)) {
			return this.allWarehouses;
		}
		return this.allWarehouses.filter((w) => !w.isArchived);
	}

	get filteredWarehouses(): Loadable<Warehouse[]> {
		if (!isReady(this.allWarehouses)) {
			return this.allWarehouses;
		}

		// «Активные | Архив» segmented view: each side shows only its set (the
		// «Архив» view swaps to archived-only, matching Partners/Products — not
		// active + archived).
		let warehouses = this.allWarehouses.filter((w) =>
			this.showArchived ? w.isArchived : !w.isArchived,
		);

		if (this.searchTerm.trim()) {
			warehouses = warehouses.filter(
				(w) => matchesSearch(w.name, this.searchTerm) || matchesSearch(w.location, this.searchTerm),
			);
		}

		return warehouses;
	}

	async getAll(options?: LoadOptions): Promise<void> {
		runInAction(() => (this.allWarehouses = "loading"));

		const result = await tryRun(() => WarehouseApi.getAll());

		if (result.status === "fail" && !options?.quiet) {
			this.notificationStore.notifyLoadError(result, "warehouse.error.getAll");
		}

		runInAction(() => (this.allWarehouses = toLoadable(result)));
	}

	/** Today's stock over every warehouse, archived ones included (rule 31) — served, never summed from the list. */
	loadStockReport(options?: ReportLoadOptions): Promise<void> {
		return this.stockReport.load(() => ReportApi.getStock({}), options);
	}

	async create(request: CreateWarehouseRequest): Promise<void> {
		const result = await withSaving(this, () => WarehouseApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "warehouse.error.create");
			return;
		}

		runInAction(() => {
			if (isReady(this.allWarehouses)) {
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
			this.notificationStore.notifyApiError(result, "warehouse.error.update");
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
			this.notificationStore.notifyApiError(result, "warehouse.error.archive");
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
			this.notificationStore.notifyApiError(result, "warehouse.error.restore");
			return null;
		}

		this.replaceWarehouse(result.data);
		this.closeDialog();
		this.notificationStore.success(
			i18next.t("warehouse.success.restore", { name: warehouse.name }),
		);
		return result.data;
	}

	async remove(warehouse: Warehouse): Promise<boolean> {
		const result = await withSaving(this, () => WarehouseApi.delete(warehouse.id));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "warehouse.error.delete");
			return false;
		}

		runInAction(() => {
			if (isReady(this.allWarehouses)) {
				this.allWarehouses = this.allWarehouses.filter((w) => w.id !== warehouse.id);
			}
		});

		this.closeDialog();
		this.notificationStore.success(i18next.t("warehouse.success.delete", { name: warehouse.name }));
		return true;
	}

	async addOpeningStock(
		warehouseId: number,
		request: AddOpeningStockRequest,
	): Promise<Warehouse | null> {
		const result = await withSaving(this, () => WarehouseApi.addOpeningStock(warehouseId, request));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "warehouse.error.openingStock");
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

	openDelete(warehouse: Warehouse): void {
		this.dialogMode = { kind: "delete", warehouse };
	}

	openCannotDelete(warehouse: Warehouse): void {
		this.dialogMode = { kind: "cannotDelete", warehouse };
	}

	openOpeningStock(warehouse: Warehouse): void {
		this.dialogMode = { kind: "opening", warehouse };
	}

	closeDialog(): void {
		this.dialogMode = { kind: "none" };
	}

	private replaceWarehouse(updated: Warehouse): void {
		runInAction(() => {
			if (isReady(this.allWarehouses)) {
				this.allWarehouses = this.allWarehouses.map((w) => (w.id === updated.id ? updated : w));
			}
		});
	}
}

export default WarehouseStore;
