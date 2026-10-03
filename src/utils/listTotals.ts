import { TransactionRecord } from "models/transaction";

import { isRefundType } from "./transactionUtils";

/**
 * Footer totals of a filtered list — display arithmetic over the served row
 * amounts, never a balance (balances stay backend-computed, hard rule 8).
 */
export const sumBy = <T>(rows: readonly T[], valueOf: (row: T) => number): number =>
	rows.reduce((sum, row) => sum + valueOf(row), 0);

/** Sales / Supplies footer: documents, their sum, refunds apart, paid and still unpaid. */
export interface TransactionTotals {
	count: number;
	amount: number;
	refunds: number;
	paid: number;
	remaining: number;
}

/**
 * Refunds are listed with unsigned amounts, so they are totalled apart instead
 * of inflating «Сумма»; paid / unpaid count only sales or supplies.
 */
export function transactionTotals(rows: readonly TransactionRecord[]): TransactionTotals {
	const documents = rows.filter((tx) => !isRefundType(tx.type));
	const refunds = rows.filter((tx) => isRefundType(tx.type));
	return {
		count: rows.length,
		amount: sumBy(documents, (tx) => tx.totalDue),
		refunds: sumBy(refunds, (tx) => tx.totalDue),
		paid: sumBy(documents, (tx) => tx.totalPaid),
		remaining: sumBy(documents, (tx) => Math.max(0, tx.totalDue - tx.totalPaid)),
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
