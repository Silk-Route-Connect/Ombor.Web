import { Measurement } from "./product";

/**
 * Order — the one mutable transaction entity: goods a customer requested, before
 * any stock or money has moved. It walks a state machine (Pending → Processing →
 * Shipping → Delivered) with Cancelled / Rejected / Returned branches, and on
 * Delivered it promotes to an immutable Sale. Pre-delivery it can be edited and
 * cancelled. Totals are computed from line items so every screen reconciles.
 *
 * The live `OrderDto` is stale relative to the redesign — it carries no status
 * history, no warehouse / promoted-sale link, and its lines no SKU/unit — so the
 * whole resource is mocked at the target v1 contract (docs/mocking.md).
 */

export const ORDER_STATUSES = [
	"Pending",
	"Processing",
	"Shipping",
	"Delivered",
	"Cancelled",
	"Rejected",
	"Returned",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_SOURCES = ["None", "Telegram", "OmborWeb"] as const;
export type OrderSource = (typeof ORDER_SOURCES)[number];

/**
 * A line discount is either a percentage or a fixed amount (mirrors transactions).
 * Wire values are the canonical backend enum names `DiscountType { Percentage, Fixed }`.
 */
export type OrderLineDiscountType = "Percentage" | "Fixed";

export type OrderLine = {
	id: number;
	productId: number;
	productName: string;
	/** Served product article + unit (mock-enriched from the catalogue). */
	sku: string;
	measurement: Measurement;
	quantity: number;
	unitPrice: number;
	/** Discount value: percent when discountType is "Percentage", currency when "Fixed", 0 = none. */
	discount: number;
	discountType: OrderLineDiscountType;
	/** Net line amount after the line discount (served). */
	total: number;
};

/** One transition in the order's status history (the detail timeline). */
export type OrderStatusEvent = {
	/** ISO datetime of the transition. */
	at: string;
	/** Previous status, or null for the creation event. */
	from: OrderStatus | null;
	to: OrderStatus;
	/** Actor who made the transition. */
	by: string;
};

export type Order = {
	id: number;
	orderNumber: string;
	customerId: number;
	customerName: string;
	/** Customer partner type label (for the partner-mini chip). */
	customerType: string;
	/** Server-computed customer net balance (for the partner-mini card). */
	customerBalance: number;
	/** ISO datetime the order was created. */
	date: string;
	status: OrderStatus;
	source: OrderSource;
	/** Free-text delivery address (the backend AddressDto is geo-only; redesign uses text). */
	deliveryAddress: string | null;
	/** Requested/expected delivery date (ISO date "YYYY-MM-DD"), or null if unset. */
	deliveryDate: string | null;
	/** Requested delivery time ("HH:mm"), or null when only a date is set. */
	deliveryTime: string | null;
	notes: string | null;
	/** Write-off warehouse, chosen at delivery confirmation (prototype flow). */
	warehouseId: number | null;
	warehouseName: string | null;
	/** The Sale this order promoted to on Delivered (self-contained reference). */
	saleId: number | null;
	/** Computed order total (sum of net line totals). */
	total: number;
	lines: OrderLine[];
	history: OrderStatusEvent[];
};

export type GetOrdersRequest = {
	searchTerm?: string | null;
	status?: OrderStatus | null;
};

export type GetOrderByIdRequest = {
	id: number;
};

export type OrderLineRequest = {
	productId: number;
	quantity: number;
	unitPrice: number;
	discount: number;
	discountType: OrderLineDiscountType;
};

/** Edit an open order (customer, source, address, note, lines) — orders are editable pre-delivery. */
export type UpdateOrderRequest = {
	id: number;
	customerId: number;
	source: OrderSource;
	deliveryAddress?: string | null;
	deliveryDate?: string | null;
	deliveryTime?: string | null;
	notes?: string | null;
	lines: OrderLineRequest[];
};

/** Confirm delivery against a chosen warehouse → promotes to a Sale (prototype flow). */
export type DeliverOrderRequest = {
	id: number;
	warehouseId: number;
};
