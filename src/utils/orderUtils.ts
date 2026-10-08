import { Order, OrderLine, OrderStatus } from "models/order";
import { ChipTokenKey, chipTokens, designTokens } from "theme";
import { formatCurrency, formatExactPercent } from "utils/formatCurrency";

export interface OrderStatusMeta {
	/** Chip colour semantics (`chipTokens` key). */
	token: ChipTokenKey;
	/** Struck-through label (Cancelled — closed without consequence). */
	strike?: boolean;
	/** Accent colour for non-chip status marks (timeline dots, tab counts). */
	accent: string;
}

/**
 * Order lifecycle colours — their own axis, never the transaction-type hues:
 * Pending neutral → Processing info blue → Shipping purple → Delivered green
 * (good terminal); Returned red, Rejected red outline (bad terminals);
 * Cancelled neutral struck through. Labels live in i18n (`order.status.*`).
 */
export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
	Pending: { token: "neutral", accent: designTokens.decoration },
	Processing: { token: "info", accent: chipTokens.info.color },
	Shipping: { token: "purple", accent: chipTokens.purple.color },
	Delivered: { token: "closed", accent: chipTokens.closed.color },
	Cancelled: { token: "neutral", strike: true, accent: designTokens.decoration },
	Rejected: { token: "dangerOutline", accent: chipTokens.danger.color },
	Returned: { token: "danger", accent: chipTokens.danger.color },
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

type DeliveryFields = Pick<Order, "status" | "deliveryDate">;

/** The requested delivery day (local midnight) of an order still to deliver; null otherwise. */
function openDeliveryDay(order: DeliveryFields): number | null {
	if (!order.deliveryDate || !PRE_DELIVERY.includes(order.status)) {
		return null;
	}
	return new Date(`${order.deliveryDate}T00:00:00`).getTime();
}

const startOfToday = (): number => new Date().setHours(0, 0, 0, 0);

/**
 * An order is overdue when it is still pre-delivery and its requested delivery
 * date is before today — flagged on the list/detail, never hidden.
 */
export function isOrderOverdue(order: DeliveryFields): boolean {
	const day = openDeliveryDay(order);
	return day !== null && day < startOfToday();
}

/** Still pre-delivery and requested for today — the bell's «Сегодня доставить». */
export function isOrderDueToday(order: DeliveryFields): boolean {
	return openDeliveryDay(order) === startOfToday();
}

/**
 * Display form of a served delivery time. The backend serializes `TimeOnly` as
 * «HH:mm:ss»; the UI shows «HH:mm».
 */
export const shortDeliveryTime = (time: string): string => time.slice(0, 5);

/**
 * Request form of a delivery time picked in the «HH:mm» TimeField. The API binds
 * `TimeOnly` only from «HH:mm:ss» — a bare «HH:mm» fails the whole body binding.
 */
export const toApiDeliveryTime = (time: string): string | null =>
	time === "" ? null : time.length === 5 ? `${time}:00` : time;

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
		? `−${formatExactPercent(line.discount)}%`
		: `−${formatCurrency(line.discount)}`;
}

/**
 * Status tabs on the list toolbar — every status, so the per-tab counts always
 * add up to «Все» (the prototype's omission of Rejected / Returned left those
 * orders unfilterable, live-ui-5).
 */
export type OrderStatusFilter = "all" | OrderStatus;
export const ORDER_STATUS_TABS: OrderStatusFilter[] = [
	"all",
	"Pending",
	"Processing",
	"Shipping",
	"Delivered",
	"Returned",
	"Cancelled",
	"Rejected",
];

/**
 * «Доставка» filter on the Orders list, kept in the URL (`?delivery=overdue`)
 * so the bell's order alerts open the list already narrowed.
 */
export type OrderDeliveryFilter = "all" | "overdue" | "today";
export const ORDER_DELIVERY_FILTERS: OrderDeliveryFilter[] = ["all", "overdue", "today"];

export const parseDeliveryFilter = (raw: string | null): OrderDeliveryFilter =>
	raw === "overdue" || raw === "today" ? raw : "all";

export function matchesDeliveryFilter(order: DeliveryFields, filter: OrderDeliveryFilter): boolean {
	if (filter === "overdue") {
		return isOrderOverdue(order);
	}
	return filter === "today" ? isOrderDueToday(order) : true;
}

/**
 * The list search: people type «№12», «#12» or the bare number, so a leading
 * prefix is stripped and the number matches EXACTLY (DR-21 numbers are short
 * integers — a substring «3» would wrongly match 13 / 30 / …); the customer
 * name stays a substring match.
 */
export function matchesOrderSearch(
	order: Pick<Order, "orderNumber" | "customerName">,
	search: string,
): boolean {
	const term = search.trim().toLowerCase();
	if (!term) {
		return true;
	}
	const numberTerm = term.replace(/^[№#]/, "");
	return (
		(numberTerm !== "" && order.orderNumber === numberTerm) ||
		order.customerName.toLowerCase().includes(term)
	);
}

/** Count of orders per status (for the tab pills). */
export function countByStatus(orders: Order[]): Record<OrderStatusFilter, number> {
	const counts = { all: orders.length } as Record<OrderStatusFilter, number>;
	ORDER_STATUS_TABS.slice(1).forEach((status) => {
		counts[status] = orders.filter((o) => o.status === status).length;
	});
	return counts;
}
