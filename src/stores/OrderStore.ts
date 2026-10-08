import { isReady, Loadable, readyOr, toLoadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { withSaving } from "helpers/WithSaving";
import i18next from "i18n/config";
import { makeAutoObservable, runInAction } from "mobx";
import { CreateOrderRequest, Order, UpdateOrderRequest } from "models/order";
import OrderApi from "services/api/OrderApi";
import { analytics } from "services/telemetry";
import { ALL_DATES, DateRangeValue, filterByDateRange, isDateRangeActive } from "utils/dateRange";
import { formatOptionalNumber } from "utils/formatEntityId";
import {
	countByStatus,
	matchesDeliveryFilter,
	matchesOrderSearch,
	ORDER_NEXT_STEP,
	OrderDeliveryFilter,
	OrderStatusFilter,
} from "utils/orderUtils";

import { NotificationStore } from "./NotificationStore";

export type OrderDialogMode =
	| { kind: "edit"; order: Order }
	| { kind: "delivery"; order: Order }
	| { kind: "cancel"; order: Order }
	| { kind: "reject"; order: Order }
	| { kind: "return"; order: Order }
	| { kind: "none" };

export class OrderStore {
	private readonly notificationStore: NotificationStore;

	allOrders: Loadable<Order[]> = "loading";
	searchTerm = "";
	statusFilter: OrderStatusFilter = "all";
	dateRange: DateRangeValue = ALL_DATES;
	deliveryFilter: OrderDeliveryFilter = "all";
	dialogMode: OrderDialogMode = { kind: "none" };
	isSaving = false;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	/** Status counts for the toolbar tabs: the period and «Доставка», before the status tab and search. */
	get statusCounts(): Record<OrderStatusFilter, number> {
		const inPeriod = filterByDateRange(readyOr(this.allOrders, []), this.dateRange, (o) => o.date);
		return countByStatus(inPeriod.filter((o) => matchesDeliveryFilter(o, this.deliveryFilter)));
	}

	/** The list view: status tab + date range + delivery + search (number or customer), newest first. */
	get listOrders(): Loadable<Order[]> {
		if (!isReady(this.allOrders)) {
			return this.allOrders;
		}

		return filterByDateRange(this.allOrders, this.dateRange, (o) => o.date)
			.filter(
				(o) =>
					(this.statusFilter === "all" || o.status === this.statusFilter) &&
					matchesDeliveryFilter(o, this.deliveryFilter) &&
					matchesOrderSearch(o, this.searchTerm),
			)
			.sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.id - a.id);
	}

	/** Whether any list filter is narrowing the view (drives empty-state copy). */
	get isFiltering(): boolean {
		return (
			this.searchTerm.trim() !== "" ||
			this.statusFilter !== "all" ||
			this.deliveryFilter !== "all" ||
			isDateRangeActive(this.dateRange)
		);
	}

	orderById(id: number): Order | null {
		if (!isReady(this.allOrders)) {
			return null;
		}
		return this.allOrders.find((o) => o.id === id) ?? null;
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.allOrders = "loading"));

		const result = await tryRun(() => OrderApi.getAll());

		runInAction(() => (this.allOrders = toLoadable(result)));
	}

	private replace(order: Order): void {
		if (isReady(this.allOrders)) {
			this.allOrders = this.allOrders.map((o) => (o.id === order.id ? order : o));
		}
	}

	/** The prominent forward action: delivery opens the warehouse dialog; others transition directly. */
	advance(order: Order): void {
		const step = ORDER_NEXT_STEP[order.status];
		if (!step) {
			return;
		}
		if (step.promote) {
			this.openDelivery(order);
			return;
		}
		if (step.action === "process") {
			void this.process(order.id);
		} else if (step.action === "ship") {
			void this.ship(order.id);
		}
	}

	private async runTransition(
		id: number,
		call: () => Promise<Order>,
		successKey: string,
		errorKey: string,
		closeDialog = false,
	): Promise<void> {
		// Read the pre-transition status before the API overwrites it in the list.
		const fromStatus = this.orderById(id)?.status;
		const result = await withSaving(this, call);
		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, errorKey);
			return;
		}
		runInAction(() => {
			this.replace(result.data);
			if (closeDialog) {
				this.dialogMode = { kind: "none" };
			}
		});
		this.notificationStore.success(
			i18next.t(successKey, {
				number: formatOptionalNumber(result.data.orderNumber, i18next.t("common.noNumberInline")),
				saleId: result.data.saleId ?? "",
			}),
		);
		analytics.capture("order_status_changed", {
			from_status: fromStatus,
			to_status: result.data.status,
		});
	}

	process(id: number): Promise<void> {
		return this.runTransition(
			id,
			() => OrderApi.process(id),
			"order.toast.processed",
			"order.error.transition",
		);
	}

	ship(id: number): Promise<void> {
		return this.runTransition(
			id,
			() => OrderApi.ship(id),
			"order.toast.shipped",
			"order.error.transition",
		);
	}

	deliver(id: number, warehouseId: number): Promise<void> {
		return this.runTransition(
			id,
			() => OrderApi.deliver(id, warehouseId),
			"order.toast.delivered",
			"order.error.deliver",
			true,
		);
	}

	cancel(id: number): Promise<void> {
		return this.runTransition(
			id,
			() => OrderApi.cancel(id),
			"order.toast.cancelled",
			"order.error.transition",
			true,
		);
	}

	reject(id: number): Promise<void> {
		return this.runTransition(
			id,
			() => OrderApi.reject(id),
			"order.toast.rejected",
			"order.error.transition",
			true,
		);
	}

	returnOrder(id: number): Promise<void> {
		return this.runTransition(
			id,
			() => OrderApi.returnOrder(id),
			"order.toast.returned",
			"order.error.transition",
			true,
		);
	}

	/** Create a new order (the full-page New Order screen). Returns it on success for navigation. */
	async create(request: CreateOrderRequest): Promise<Order | null> {
		const result = await withSaving(this, () => OrderApi.create(request));
		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "order.error.create");
			return null;
		}
		runInAction(() => {
			if (isReady(this.allOrders)) {
				this.allOrders = [result.data, ...this.allOrders];
			}
		});
		this.notificationStore.success(
			i18next.t("order.toast.created", {
				number: formatOptionalNumber(result.data.orderNumber, i18next.t("common.noNumberInline")),
			}),
		);
		analytics.capture("order_created", {
			source: request.source,
			line_count: request.lines.length,
			total: result.data.total,
			has_delivery_time: result.data.deliveryTime != null,
		});
		return result.data;
	}

	async update(request: UpdateOrderRequest): Promise<void> {
		const result = await withSaving(this, () => OrderApi.update(request));
		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "order.error.update");
			return;
		}
		runInAction(() => {
			this.replace(result.data);
			this.dialogMode = { kind: "none" };
		});
		this.notificationStore.success(
			i18next.t("order.toast.updated", {
				number: formatOptionalNumber(result.data.orderNumber, i18next.t("common.noNumberInline")),
			}),
		);
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setStatusFilter(status: OrderStatusFilter): void {
		this.statusFilter = status;
	}

	setDateRange(range: DateRangeValue): void {
		this.dateRange = range;
	}

	setDeliveryFilter(filter: OrderDeliveryFilter): void {
		this.deliveryFilter = filter;
	}

	/** The delivery filter is not reset here — it follows the page URL (`?delivery=`). */
	resetFilters(): void {
		this.searchTerm = "";
		this.statusFilter = "all";
		this.dateRange = ALL_DATES;
	}

	openEdit(order: Order): void {
		this.dialogMode = { kind: "edit", order };
	}

	openDelivery(order: Order): void {
		this.dialogMode = { kind: "delivery", order };
	}

	openCancel(order: Order): void {
		this.dialogMode = { kind: "cancel", order };
	}

	openReject(order: Order): void {
		this.dialogMode = { kind: "reject", order };
	}

	openReturn(order: Order): void {
		this.dialogMode = { kind: "return", order };
	}

	closeDialog(): void {
		this.dialogMode = { kind: "none" };
	}
}

export default OrderStore;
