import { isReady, toLoadable } from "helpers/Loading";
import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";
import { ALL_DATES, DateRangeValue, filterByDateRange, isDateRangeActive } from "utils/dateRange";
import { formatQuantity } from "utils/formatCurrency";
import { measurementShort } from "utils/productUtils";
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
	dateRange: DateRangeValue;
	isFiltering: boolean;
	isSaving: boolean;
	dialogMode: AdjustmentDialogMode;

	getAll(): Promise<void>;
	/** The adjustment `/adjustments/:id` names, from the loaded list; null = not found. */
	findById(id: number | null): Loadable<StockAdjustment | null>;
	/** Resolve with the created adjustment, or null on failure (over-stock etc.). */
	create(request: CreateStockAdjustmentRequest): Promise<StockAdjustment | null>;

	setSearch(term: string): void;
	setWarehouseFilter(warehouseId: number | null): void;
	setDirectionFilter(filter: DirectionFilter): void;
	setDateRange(range: DateRangeValue): void;

	openCreate(): void;
	closeDialog(): void;
}

export class StockAdjustmentStore implements IStockAdjustmentStore {
	private readonly notificationStore: NotificationStore;

	allAdjustments: Loadable<StockAdjustment[]> = "loading";
	searchTerm = "";
	warehouseFilter: number | null = null;
	directionFilter: DirectionFilter = "all";
	dateRange: DateRangeValue = ALL_DATES;
	isSaving = false;
	dialogMode: AdjustmentDialogMode = { kind: "none" };

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	/** Whether search, a filter or the period narrows the list (drives the empty-state copy). */
	get isFiltering(): boolean {
		return (
			this.searchTerm.trim().length > 0 ||
			this.warehouseFilter != null ||
			this.directionFilter !== "all" ||
			isDateRangeActive(this.dateRange)
		);
	}

	get filteredAdjustments(): Loadable<StockAdjustment[]> {
		if (!isReady(this.allAdjustments)) {
			return this.allAdjustments;
		}

		let rows = filterByDateRange(this.allAdjustments, this.dateRange, (a) => a.date);

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

	// The API has no by-id read for adjustments; the list page loads them all anyway.
	findById(id: number | null): Loadable<StockAdjustment | null> {
		if (id === null) {
			return null;
		}
		if (!isReady(this.allAdjustments)) {
			return this.allAdjustments;
		}
		return this.allAdjustments.find((a) => a.id === id) ?? null;
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.allAdjustments = "loading"));

		const result = await tryRun(() => StockAdjustmentApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.notifyLoadError(result, "adjustment.error.getAll");
		}

		runInAction(() => (this.allAdjustments = toLoadable(result)));
	}

	async create(request: CreateStockAdjustmentRequest): Promise<StockAdjustment | null> {
		const result = await withSaving(this, () => StockAdjustmentApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "adjustment.error.create");
			return null;
		}

		runInAction(() => {
			if (isReady(this.allAdjustments)) {
				this.allAdjustments = [result.data, ...this.allAdjustments];
			}
		});

		this.closeDialog();
		this.notificationStore.success(
			i18next.t(`adjustment.success.create.${result.data.direction}`, {
				product: result.data.productName,
				quantity: formatQuantity(result.data.quantity),
				unit: measurementShort(i18next.t, result.data.measurement),
			}),
		);
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

	setDateRange(range: DateRangeValue): void {
		this.dateRange = range;
	}

	openCreate(): void {
		this.dialogMode = { kind: "create" };
	}

	closeDialog(): void {
		this.dialogMode = { kind: "none" };
	}
}

export default StockAdjustmentStore;
