import { TransactionLine, TransactionRecord } from "models/transaction";

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

/** How a refund of one product is priced — never from what the client sends. */
export interface RefundPricing {
	/** The unit price the server books: the original line's, or the weighted net price of several. */
	unitPrice: number;
	/** What `qty` units refund, after the original discount. */
	amountFor(qty: number): number;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

const lineAmount = (
	unitPrice: number,
	qty: number,
	line: Pick<TransactionLine, "discount" | "discountType">,
	discount: number,
): number => {
	const gross = unitPrice * qty;
	if (!discount) {
		return gross;
	}
	return line.discountType === "Percentage"
		? gross - (gross * Math.min(discount, 100)) / 100
		: gross - Math.min(discount, gross);
};

/**
 * The server's refund pricing (backend-contracts/transactions-payments.md → Refund
 * rules): one original line gives its unit price and discount — a percentage kept,
 * a fixed amount pro-rated to the refunded quantity (2 decimals); a product sold on
 * several lines refunds at their quantity-weighted net unit price, no discount. The
 * modal shows exactly what will be booked.
 */
export const refundPricing = (tx: TransactionRecord, productId: number): RefundPricing => {
	const lines = tx.lines.filter((l) => l.productId === productId);
	if (lines.length === 1) {
		const [line] = lines;
		const discountFor = (qty: number): number =>
			line.discountType === "Percentage" || line.quantity === 0
				? line.discount
				: round2((line.discount * qty) / line.quantity);
		return {
			unitPrice: line.unitPrice,
			amountFor: (qty) => lineAmount(line.unitPrice, qty, line, discountFor(qty)),
		};
	}
	const soldQty = lines.reduce((sum, l) => sum + l.quantity, 0);
	const unitPrice =
		soldQty === 0 ? 0 : round2(lines.reduce((sum, l) => sum + l.total, 0) / soldQty);
	return { unitPrice, amountFor: (qty) => unitPrice * qty };
};

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
