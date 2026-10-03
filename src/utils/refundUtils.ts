import { TransactionRecord } from "models/transaction";

import { isRefundType } from "./transactionUtils";

/** One line of a sale / supply with what already went back and what still can (R5). */
export interface RefundableLine {
	productId: number;
	sold: number;
	refunded: number;
	available: number;
}

/** Per original line: sold, already refunded (the prior refunds' lines of that product) and still refundable. */
export const refundableLines = (
	tx: TransactionRecord,
	priorRefunds: readonly TransactionRecord[],
): RefundableLine[] =>
	tx.lines.map((line) => {
		const refunded = priorRefunds.reduce(
			(sum, refund) =>
				sum +
				refund.lines
					.filter((rl) => rl.productId === line.productId)
					.reduce((s, rl) => s + rl.quantity, 0),
			0,
		);
		return {
			productId: line.productId,
			sold: line.quantity,
			refunded,
			available: line.quantity - refunded,
		};
	});

/** Every line already went back in full — nothing is left to refund. A refund itself is never refundable. */
export const isFullyRefunded = (
	tx: TransactionRecord,
	priorRefunds: readonly TransactionRecord[],
): boolean =>
	!isRefundType(tx.type) &&
	priorRefunds.length > 0 &&
	refundableLines(tx, priorRefunds).every((line) => line.available <= 0);

/** Refunds grouped by the id of the sale / supply they reverse. */
export const refundsByOriginal = (
	all: readonly TransactionRecord[],
): Map<number, TransactionRecord[]> => {
	const byOriginal = new Map<number, TransactionRecord[]>();
	for (const tx of all) {
		if (tx.originalTransactionId == null) {
			continue;
		}
		const refunds = byOriginal.get(tx.originalTransactionId) ?? [];
		refunds.push(tx);
		byOriginal.set(tx.originalTransactionId, refunds);
	}
	return byOriginal;
};
