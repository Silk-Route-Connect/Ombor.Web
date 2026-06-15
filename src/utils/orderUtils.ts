import { Order, OrderLine, OrderStatus } from "models/order";

/** Chip tone per status (maps to the MUI palette; "neutral" is a gray treatment). */
export type OrderStatusTone = "neutral" | "info" | "warning" | "success" | "error";

/** Visual variant of the status chip (soft fill, struck-through, or outlined). */
export type OrderChipVariant = "soft" | "strike" | "outline";

export interface OrderStatusMeta {
	tone: OrderStatusTone;
	variant: OrderChipVariant;
}

/** Per-status chip styling. Labels live in i18n (`order.status.*`). */
export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
	Pending: { tone: "neutral", variant: "soft" },
	Processing: { tone: "info", variant: "soft" },
	Shipping: { tone: "warning", variant: "soft" },
	Delivered: { tone: "success", variant: "soft" },
	Cancelled: { tone: "neutral", variant: "strike" },
	Rejected: { tone: "error", variant: "outline" },
	Returned: { tone: "error", variant: "soft" },
};

/** The linear happy-path drawn by the detail stepper. */
export const ORDER_FLOW: OrderStatus[] = ["Pending", "Processing", "Shipping", "Delivered"];

/** Pre-delivery states — editable and cancellable. */
export const PRE_DELIVERY: OrderStatus[] = ["Pending", "Processing", "Shipping"];

/** The transition endpoint name backing each forward step (matches /api/orders/{id}/{action}). */
export type OrderTransitionAction = "process" | "ship" | "deliver";

export interface OrderForwardStep {
	to: OrderStatus;
	action: OrderTransitionAction;
	/** Delivery promotes the order to a Sale and needs the warehouse dialog first. */
	promote?: boolean;
}

/** The forward transition available from a given state (drives the prominent button). */
export const ORDER_NEXT_STEP: Partial<Record<OrderStatus, OrderForwardStep>> = {
	Pending: { to: "Processing", action: "process" },
	Processing: { to: "Shipping", action: "ship" },
	Shipping: { to: "Delivered", action: "deliver", promote: true },
};

/**
 * An order is overdue when it is still pre-delivery and its requested delivery
 * date is before today — flagged on the list/detail, never hidden.
 */
export function isOrderOverdue(order: Pick<Order, "status" | "deliveryDate">): boolean {
	if (!order.deliveryDate || !PRE_DELIVERY.includes(order.status)) {
		return false;
	}
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const due = new Date(`${order.deliveryDate}T00:00:00`);
	return due.getTime() < today.getTime();
}

/** Visual state of an order's delivery date: overdue · done · upcoming. */
export type DeliveryDateState = "overdue" | "done" | "upcoming";
export function deliveryDateState(
	order: Pick<Order, "status" | "deliveryDate">,
): DeliveryDateState {
	if (isOrderOverdue(order)) {
		return "overdue";
	}
	return order.status === "Delivered" || order.status === "Returned" ? "done" : "upcoming";
}

export const isOrderEditable = (status: OrderStatus): boolean => PRE_DELIVERY.includes(status);
export const isOrderCancelable = (status: OrderStatus): boolean => PRE_DELIVERY.includes(status);
export const isOrderFinal = (status: OrderStatus): boolean =>
	["Delivered", "Cancelled", "Rejected", "Returned"].includes(status);

/* ───────────────────────────── line math ───────────────────────────── */

export const lineGross = (line: Pick<OrderLine, "quantity" | "unitPrice">): number =>
	line.quantity * line.unitPrice;

/** Discount amount for a line: percent of gross, or a fixed amount capped at gross. */
export function lineDiscountAmount(
	line: Pick<OrderLine, "quantity" | "unitPrice" | "discount" | "discountType">,
): number {
	if (!line.discount) {
		return 0;
	}
	const gross = lineGross(line);
	return line.discountType === "pct"
		? Math.round((gross * line.discount) / 100)
		: Math.min(line.discount, gross);
}

export const lineNet = (
	line: Pick<OrderLine, "quantity" | "unitPrice" | "discount" | "discountType">,
): number => lineGross(line) - lineDiscountAmount(line);

export const orderSubtotal = (lines: OrderLine[]): number =>
	lines.reduce((sum, l) => sum + lineGross(l), 0);

export const orderDiscountTotal = (lines: OrderLine[]): number =>
	lines.reduce((sum, l) => sum + lineDiscountAmount(l), 0);

export const orderTotal = (lines: OrderLine[]): number =>
	lines.reduce((sum, l) => sum + lineNet(l), 0);

/** Short discount label («−10 %» / «−5 000») or null when there is no discount. */
export function discountShortLabel(
	line: Pick<OrderLine, "discount" | "discountType">,
): string | null {
	if (!line.discount) {
		return null;
	}
	return line.discountType === "pct"
		? `−${line.discount}%`
		: `−${line.discount.toLocaleString("ru-RU")}`;
}

/** Status tabs on the list toolbar (the prototype omits Rejected / Returned). */
export type OrderStatusFilter = "all" | OrderStatus;
export const ORDER_STATUS_TABS: OrderStatusFilter[] = [
	"all",
	"Pending",
	"Processing",
	"Shipping",
	"Delivered",
	"Cancelled",
];

/** Count of orders per status (for the tab pills). */
export function countByStatus(orders: Order[]): Record<OrderStatusFilter, number> {
	const counts = { all: orders.length } as Record<OrderStatusFilter, number>;
	ORDER_STATUS_TABS.slice(1).forEach((status) => {
		counts[status] = orders.filter((o) => o.status === status).length;
	});
	return counts;
}
