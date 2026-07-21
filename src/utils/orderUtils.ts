import { Order, OrderLine, OrderStatus } from "models/order";
import { chipTokens, designTokens } from "theme";
import { formatCurrency } from "utils/formatCurrency";

/** Resolved chip appearance (fill + text + border) — always drawn from `chipTokens`. */
export interface OrderChipStyle {
	bg: string;
	color: string;
	border: string;
}

export interface OrderStatusMeta {
	chip: OrderChipStyle;
	/** Struck-through label (Cancelled — closed without consequence). */
	strike?: boolean;
	/** Accent colour for non-chip status marks (timeline dots, tab counts). */
	accent: string;
}

/**
 * Per-status chip styling via `chipTokens` — lifecycle semantics on the locked
 * palette: work-in-progress states carry the brand hues (Processing = teal,
 * Shipping = saffron), terminal states the semantic ones (Delivered = green =
 * good-terminal, Returned / Rejected = red = bad-terminal; Rejected keeps the
 * outline variant to stay distinguishable from Returned). Pending / Cancelled
 * are neutral. Status chips may use the full semantic palette — the green/red
 * money reservation applies to amount / balance figures, not status.
 * Labels live in i18n (`order.status.*`).
 */
export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
	Pending: { chip: chipTokens.neutral, accent: designTokens.gray400 },
	Processing: { chip: chipTokens.sale, accent: chipTokens.sale.color },
	Shipping: { chip: chipTokens.supply, accent: chipTokens.supply.color },
	Delivered: { chip: chipTokens.closed, accent: chipTokens.closed.color },
	Cancelled: { chip: chipTokens.neutral, strike: true, accent: designTokens.gray400 },
	Rejected: {
		chip: { bg: "transparent", color: chipTokens.overdue.color, border: chipTokens.overdue.border },
		accent: chipTokens.overdue.color,
	},
	Returned: { chip: chipTokens.overdue, accent: chipTokens.overdue.color },
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

/**
 * Display form of a served delivery time. The backend serializes `TimeOnly` as
 * «HH:mm:ss» (the mock seeds «HH:mm») — the UI shows «HH:mm» either way.
 */
export const shortDeliveryTime = (time: string): string => time.slice(0, 5);

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
	return line.discountType === "Percentage"
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
	return line.discountType === "Percentage"
		? `−${line.discount}%`
		: `−${formatCurrency(line.discount)}`;
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
