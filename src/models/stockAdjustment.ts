import { Measurement } from "./product";

/**
 * Stock adjustment — a standalone, immutable, audited, partner-less,
 * payment-less stock event with a direction and a mandatory reason
 * (business-rules §E, rules 23–25). It is NOT a transaction type. A Decrease
 * records loss (damage / theft / expiry / loss) at WAC; an Increase restores
 * units (found stock / recount correction) at current WAC. No backend endpoint
 * exists yet, so the resource is mocked at this target v1 contract under
 * `/api/stock-adjustments` (docs/mocking.md).
 */
export const ADJUSTMENT_DIRECTIONS = ["Decrease", "Increase"] as const;
export type AdjustmentDirection = (typeof ADJUSTMENT_DIRECTIONS)[number];

/**
 * Reason is a closed set keyed by direction (localized in the UI per hard rule
 * 2). Decrease covers loss/expiry/theft/recount-down; Increase covers
 * found-stock/recount-up. `Other` is shared by both.
 */
export const DECREASE_REASONS = ["Damage", "Expiry", "Theft", "RecountDown", "Other"] as const;
export const INCREASE_REASONS = ["Found", "RecountUp", "Other"] as const;
export type AdjustmentReason =
	| (typeof DECREASE_REASONS)[number]
	| (typeof INCREASE_REASONS)[number];

export function reasonsFor(direction: AdjustmentDirection): readonly AdjustmentReason[] {
	return direction === "Decrease" ? DECREASE_REASONS : INCREASE_REASONS;
}

export type StockAdjustment = {
	id: number;
	/** ISO date-time string (carries the audited timestamp). */
	date: string;
	warehouseId: number;
	warehouseName: string;
	productId: number;
	productName: string;
	sku: string;
	categoryName: string | null;
	measurement: Measurement;
	direction: AdjustmentDirection;
	/** Positive magnitude; the direction carries the sign. */
	quantity: number;
	reason: AdjustmentReason;
	note: string | null;
	/** Audit: who recorded the event. */
	createdBy: string;
	/** Served stock of this product in this warehouse right after the event. */
	balanceAfter: number;
};

export type CreateStockAdjustmentRequest = {
	warehouseId: number;
	productId: number;
	direction: AdjustmentDirection;
	quantity: number;
	reason: AdjustmentReason;
	note: string | null;
};
