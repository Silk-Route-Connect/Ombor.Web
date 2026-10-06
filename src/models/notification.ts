/**
 * The topbar bell's alerts (`GET /api/notifications`,
 * backend-contracts/notifications.md): computed from the organization's data on
 * every read — nothing is stored server-side and an alert disappears as soon as
 * its cause is fixed. Not to be confused with `NotificationStore` (toasts).
 */
import { ActivityEntityKind } from "./activity";
import { Measurement } from "./product";

/** Served in this order: the most pressing first. */
export type NotificationKind =
	| "OverdueReceivables"
	| "OrdersOverdue"
	| "LowStock"
	| "OrdersDueToday";

export type NotificationSeverity = "Warning" | "Info";

/** One record behind an alert; fields a kind does not use are omitted. */
export type NotificationItem = {
	/** `Sale`, `Order` or `Product`. */
	entityKind: ActivityEntityKind;
	id: number;
	/** The product name, or a document's bare number; absent for an unnumbered document. */
	label?: string | null;
	/** The product's SKU, the partner of a sale, the customer of an order. */
	detail?: string | null;
	/** A sale's remaining amount; an order's total. */
	amount?: number | null;
	/** `LowStock`: stock over all warehouses. */
	quantity?: number | null;
	/** `LowStock`: the product's «Минимальный остаток». */
	threshold?: number | null;
	measurement?: Measurement | null;
	/** A sale's due date or an order's delivery date («YYYY-MM-DD»). */
	date?: string | null;
	/** Days past that date (0 = today). */
	days?: number | null;
};

export type NotificationAlert = {
	kind: NotificationKind;
	severity: NotificationSeverity;
	/** How many records the alert concerns — always > 0. */
	count: number;
	/** `OverdueReceivables` only: the remaining sum. */
	amount?: number | null;
	/** Up to 10 of the records, most pressing first. */
	items: NotificationItem[];
};
