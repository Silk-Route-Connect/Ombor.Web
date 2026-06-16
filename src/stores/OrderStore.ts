import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { withSaving } from "helpers/WithSaving";
import i18next from "i18n/config";
import { makeAutoObservable, runInAction } from "mobx";
import { CreateOrderRequest, Order, UpdateOrderRequest } from "models/order";
import OrderApi from "services/api/OrderApi";
import { countByStatus, ORDER_NEXT_STEP, OrderStatusFilter } from "utils/orderUtils";

import { NotificationStore } from "./NotificationStore";

export type OrderDateRange = "all" | "7" | "30" | "90";

export type OrderDialogMode =
	| { kind: "edit"; order: Order }
	| { kind: "delivery"; order: Order }
	| { kind: "cancel"; order: Order }
	| { kind: "reject"; order: Order }
	| { kind: "return"; order: Order }
	| { kind: "none" };

const MS_PER_DAY = 86_400_000;

export class OrderStore {
	private readonly notificationStore: NotificationStore;

	allOrders: Loadable<Order[]> = "loading";
	searchTerm = "";
	statusFilter: OrderStatusFilter = "all";
	dateRange: OrderDateRange = "all";
	dialogMode: OrderDialogMode = { kind: "none" };
	isSaving = false;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	/** Status counts for the toolbar tabs (from the unfiltered set). */
	get statusCounts(): Record<OrderStatusFilter, number> {
		const all = this.allOrders === "loading" ? [] : this.allOrders;
		return countByStatus(all);
	}

	/** The list view: status tab + date range + search (number or customer), newest first. */
	get listOrders(): Loadable<Order[]> {
		if (this.allOrders === "loading") {
			return "loading";
		}

		let list = [...this.allOrders];

		if (this.statusFilter !== "all") {
			list = list.filter((o) => o.status === this.statusFilter);
		}

		if (this.dateRange !== "all") {
			const days = Number(this.dateRange);
			list = list.filter((o) => (Date.now() - Date.parse(o.date)) / MS_PER_DAY <= days);
		}

		const term = this.searchTerm.trim().toLowerCase();
		if (term) {
			list = list.filter(
				(o) =>
					`#${o.orderNumber}`.toLowerCase().includes(term) ||
					o.customerName.toLowerCase().includes(term),
			);
		}

		return list.sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.id - a.id);
	}

	/** Whether any list filter is narrowing the view (drives empty-state copy). */
	get isFiltering(): boolean {
		return this.searchTerm.trim() !== "" || this.statusFilter !== "all" || this.dateRange !== "all";
	}

	orderById(id: number): Order | null {
		if (this.allOrders === "loading") {
			return null;
		}
		return this.allOrders.find((o) => o.id === id) ?? null;
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.allOrders = "loading"));

		const result = await tryRun(() => OrderApi.getAll());
		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("order.error.getAll"));
		}

		runInAction(() => (this.allOrders = result.status === "success" ? result.data : []));
	}

	private replace(order: Order): void {
		if (this.allOrders !== "loading") {
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
		call: () => Promise<Order>,
		successKey: string,
		errorKey: string,
		closeDialog = false,
	): Promise<void> {
		const result = await withSaving(this, call);
		if (result.status === "fail") {
			this.notificationStore.error(i18next.t(errorKey));
			return;
		}
		runInAction(() => {
			this.replace(result.data);
			if (closeDialog) {
				this.dialogMode = { kind: "none" };
			}
		});
		this.notificationStore.success(
			i18next.t(successKey, { number: result.data.orderNumber, saleId: result.data.saleId ?? "" }),
		);
	}

	process(id: number): Promise<void> {
		return this.runTransition(
			() => OrderApi.process(id),
			"order.toast.processed",
			"order.error.transition",
		);
	}

	ship(id: number): Promise<void> {
		return this.runTransition(
			() => OrderApi.ship(id),
			"order.toast.shipped",
			"order.error.transition",
		);
	}

	deliver(id: number, warehouseId: number): Promise<void> {
		return this.runTransition(
			() => OrderApi.deliver(id, warehouseId),
			"order.toast.delivered",
			"order.error.deliver",
			true,
		);
	}

	cancel(id: number): Promise<void> {
		return this.runTransition(
			() => OrderApi.cancel(id),
			"order.toast.cancelled",
			"order.error.transition",
			true,
		);
	}

	reject(id: number): Promise<void> {
		return this.runTransition(
			() => OrderApi.reject(id),
			"order.toast.rejected",
			"order.error.transition",
			true,
		);
	}

	returnOrder(id: number): Promise<void> {
		return this.runTransition(
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
			this.notificationStore.error(i18next.t("order.error.create"));
			return null;
		}
		runInAction(() => {
			if (this.allOrders !== "loading") {
				this.allOrders = [result.data, ...this.allOrders];
			}
		});
		this.notificationStore.success(
			i18next.t("order.toast.created", { number: result.data.orderNumber }),
		);
		return result.data;
	}

	async update(request: UpdateOrderRequest): Promise<void> {
		const result = await withSaving(this, () => OrderApi.update(request));
		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("order.error.update"));
			return;
		}
		runInAction(() => {
			this.replace(result.data);
			this.dialogMode = { kind: "none" };
		});
		this.notificationStore.success(
			i18next.t("order.toast.updated", { number: result.data.orderNumber }),
		);
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setStatusFilter(status: OrderStatusFilter): void {
		this.statusFilter = status;
	}

	setDateRange(range: OrderDateRange): void {
		this.dateRange = range;
	}

	resetFilters(): void {
		this.searchTerm = "";
		this.statusFilter = "all";
		this.dateRange = "all";
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
