import { Order, OrderStatus } from "models/order";
import { StockAdjustment } from "models/stockAdjustment";
import { TransactionRecord } from "models/transaction";

import { isRefundType } from "./transactionUtils";

/**
 * Footer totals of a filtered list — display arithmetic over the served row
 * amounts, never a balance (balances stay backend-computed, hard rule 8).
 */
export const sumBy = <T>(rows: readonly T[], valueOf: (row: T) => number): number =>
	rows.reduce((sum, row) => sum + valueOf(row), 0);

/** Sales / Supplies footer: documents, their net sum, refunds named apart, paid and still unpaid. */
export interface TransactionTotals {
	count: number;
	/** Sales (or supplies) minus their refunds — the sum of the list's signed «Сумма» column. */
	amount: number;
	/** The refunds netted out of `amount`, as a positive figure. */
	refunds: number;
	paid: number;
	remaining: number;
}

/**
 * A refund row reads negative (D12), so «Сумма» nets refunds out exactly as the
 * column adds up; «Возвраты» shows the refunded part. Paid / unpaid count only
 * sales or supplies.
 */
export function transactionTotals(rows: readonly TransactionRecord[]): TransactionTotals {
	const documents = rows.filter((tx) => !isRefundType(tx.type));
	const refunds = sumBy(
		rows.filter((tx) => isRefundType(tx.type)),
		(tx) => tx.totalDue,
	);
	return {
		count: rows.length,
		amount: sumBy(documents, (tx) => tx.totalDue) - refunds,
		refunds,
		paid: sumBy(documents, (tx) => tx.totalPaid),
		remaining: sumBy(documents, (tx) => Math.max(0, tx.totalDue - tx.totalPaid)),
	};
}

/** Orders that will never be sold — their sum would overstate the orders on the list. */
const DROPPED_ORDER_STATUSES: ReadonlySet<OrderStatus> = new Set(["Cancelled", "Rejected"]);

/** Orders footer: the count and the sum of the live orders. */
export interface OrderTotals {
	count: number;
	amount: number;
	/** Some listed orders are cancelled / rejected and left out of `amount` (the label says so). */
	excludesDropped: boolean;
}

/**
 * «Сумма» leaves cancelled and rejected orders out. On a list made only of them
 * (the «Отменён» / «Отклонён» tab) nothing else is left, so it sums what is listed.
 */
export function orderTotals(rows: readonly Order[]): OrderTotals {
	const live = rows.filter((o) => !DROPPED_ORDER_STATUSES.has(o.status));
	const excludesDropped = live.length > 0 && live.length < rows.length;
	return {
		count: rows.length,
		amount: sumBy(live.length > 0 ? live : rows, (o) => o.total),
		excludesDropped,
	};
}

/** Payments / wallet operations footer: money in and money out. */
export interface DirectionTotals {
	count: number;
	income: number;
	expense: number;
}

export function directionTotals<T>(
	rows: readonly T[],
	amountOf: (row: T) => number,
	isIncome: (row: T) => boolean,
): DirectionTotals {
	return {
		count: rows.length,
		income: sumBy(rows, (row) => (isIncome(row) ? amountOf(row) : 0)),
		expense: sumBy(rows, (row) => (isIncome(row) ? 0 : amountOf(row))),
	};
}

/**
 * The served value of an adjustment, or null where none was recorded: an
 * Increase from before 2026-10-04 carries no cost snapshot (served as 0).
 */
export const adjustmentValue = (a: StockAdjustment): number | null =>
	a.direction === "Increase" && a.unitCost === 0 && a.quantity > 0 ? null : a.value;

/** Stock adjustments footer: what was written off and what was restored, at the served cost. */
export interface AdjustmentTotals {
	count: number;
	writtenOff: number;
	restored: number;
}

export function adjustmentTotals(rows: readonly StockAdjustment[]): AdjustmentTotals {
	return {
		count: rows.length,
		writtenOff: sumBy(rows, (a) => (a.direction === "Decrease" ? a.value : 0)),
		restored: sumBy(rows, (a) => (a.direction === "Increase" ? a.value : 0)),
	};
}
