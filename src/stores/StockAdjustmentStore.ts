import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";
import { matchesSearch } from "utils/stringUtils";

import { Loadable, tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
import {
	AdjustmentDirection,
	CreateStockAdjustmentRequest,
	StockAdjustment,
} from "../models/stockAdjustment";
import StockAdjustmentApi from "../services/api/StockAdjustmentApi";
import { analytics } from "../services/telemetry";
import { NotificationStore } from "./NotificationStore";

export type DirectionFilter = "all" | AdjustmentDirection;

export type AdjustmentDialogMode = { kind: "create" } | { kind: "none" };

export interface IStockAdjustmentStore {
	allAdjustments: Loadable<StockAdjustment[]>;
	filteredAdjustments: Loadable<StockAdjustment[]>;

	searchTerm: string;
	warehouseFilter: number | null;
	directionFilter: DirectionFilter;
	isSaving: boolean;
	dialogMode: AdjustmentDialogMode;

	getAll(): Promise<void>;
	/** Resolve with the created adjustment, or null on failure (over-stock etc.). */
	create(request: CreateStockAdjustmentRequest): Promise<StockAdjustment | null>;

	setSearch(term: string): void;
	setWarehouseFilter(warehouseId: number | null): void;
	setDirectionFilter(filter: DirectionFilter): void;

	openCreate(): void;
	closeDialog(): void;
}

export class StockAdjustmentStore implements IStockAdjustmentStore {
	private readonly notificationStore: NotificationStore;

	allAdjustments: Loadable<StockAdjustment[]> = "loading";
	searchTerm = "";
	warehouseFilter: number | null = null;
	directionFilter: DirectionFilter = "all";
	isSaving = false;
	dialogMode: AdjustmentDialogMode = { kind: "none" };

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	get filteredAdjustments(): Loadable<StockAdjustment[]> {
		if (this.allAdjustments === "loading") {
			return "loading";
		}

		let rows = this.allAdjustments;

		if (this.warehouseFilter != null) {
			rows = rows.filter((a) => a.warehouseId === this.warehouseFilter);
		}

		if (this.directionFilter !== "all") {
			rows = rows.filter((a) => a.direction === this.directionFilter);
		}

		if (this.searchTerm.trim()) {
			rows = rows.filter(
				(a) =>
					matchesSearch(a.productName, this.searchTerm) || matchesSearch(a.sku, this.searchTerm),
			);
		}

		return rows;
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.allAdjustments = "loading"));

		const result = await tryRun(() => StockAdjustmentApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("adjustment.error.getAll"));
		}

		runInAction(() => (this.allAdjustments = result.status === "success" ? result.data : []));
	}

	async create(request: CreateStockAdjustmentRequest): Promise<StockAdjustment | null> {
		const result = await withSaving(this, () => StockAdjustmentApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("adjustment.error.create"));
			return null;
		}

		runInAction(() => {
			if (this.allAdjustments !== "loading") {
				this.allAdjustments = [result.data, ...this.allAdjustments];
			}
		});

		this.closeDialog();
		this.notificationStore.success(i18next.t("adjustment.success.create"));
		analytics.capture("stock_adjustment_created", {
			direction: request.direction,
			reason: request.reason,
		});
		return result.data;
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setWarehouseFilter(warehouseId: number | null): void {
		this.warehouseFilter = warehouseId;
	}

	setDirectionFilter(filter: DirectionFilter): void {
		this.directionFilter = filter;
	}

	openCreate(): void {
		this.dialogMode = { kind: "create" };
	}

	closeDialog(): void {
		this.dialogMode = { kind: "none" };
	}
}

export default StockAdjustmentStore;
