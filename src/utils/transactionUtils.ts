import {
	PaymentStatus,
	TransactionLine,
	TransactionRecord,
	TransactionType,
} from "models/transaction";
import { formatCurrency } from "utils/formatCurrency";

/** A page direction: Sales (goods out, partner owes us) or Supplies (goods in, we owe). */
export type TransactionDirection = "Sale" | "Supply";

/** Transaction types that belong in each direction's feed (base event + its refund). */
export const DIRECTION_TYPES: Record<TransactionDirection, TransactionType[]> = {
	Sale: ["Sale", "SaleRefund"],
	Supply: ["Supply", "SupplyRefund"],
};

export const baseTypeFor = (direction: TransactionDirection): TransactionType => direction;

export const refundTypeFor = (direction: TransactionDirection): TransactionType =>
	direction === "Sale" ? "SaleRefund" : "SupplyRefund";

export const isRefundType = (type: TransactionType): boolean =>
	type === "SaleRefund" || type === "SupplyRefund";

export const directionOf = (type: TransactionType): TransactionDirection =>
	type === "Sale" || type === "SaleRefund" ? "Sale" : "Supply";

/* ───────────────────────── line + total math ─────────────────────────
   Mirrors the design's sales-data.jsx: every total is computed from line
   items so each screen reconciles digit-for-digit. The mock serves the same
   computed values; these helpers drive the detail's footer breakdown. */

export const lineGross = (line: Pick<TransactionLine, "quantity" | "unitPrice">): number =>
	line.quantity * line.unitPrice;

export const lineNet = (
	line: Pick<TransactionLine, "quantity" | "unitPrice" | "discount" | "discountType">,
): number => {
	const gross = lineGross(line);
	if (!line.discount || !line.discountType) {
		return gross;
	}
	return line.discountType === "pct"
		? Math.round(gross * (1 - line.discount / 100))
		: gross - line.discount;
};

/** Human label for a line discount: «−10%» / «−5 000» / null when none. */
export const discountLabel = (
	line: Pick<TransactionLine, "discount" | "discountType">,
): string | null => {
	if (!line.discount || !line.discountType) {
		return null;
	}
	return line.discountType === "pct" ? `−${line.discount}%` : `−${formatCurrency(line.discount)}`;
};

/** Effective per-unit price after the line discount (used to seed refund prices). */
export const effectiveUnitPrice = (line: TransactionLine): number =>
	line.quantity ? Math.round(lineNet(line) / line.quantity) : line.unitPrice;

export const txSubtotal = (lines: TransactionLine[]): number =>
	lines.reduce((sum, l) => sum + lineGross(l), 0);

export const txDiscountTotal = (lines: TransactionLine[]): number =>
	lines.reduce((sum, l) => sum + (lineGross(l) - lineNet(l)), 0);

export const txTotal = (lines: TransactionLine[]): number =>
	lines.reduce((sum, l) => sum + lineNet(l), 0);

/** Derive payment status from served totals (paid ⇒ remaining ≤ 0; partial ⇒ some paid). */
export const payStatusOf = (totalDue: number, totalPaid: number): PaymentStatus => {
	if (totalDue - totalPaid <= 0) {
		return "paid";
	}
	return totalPaid > 0 ? "partial" : "unpaid";
};

/** MUI palette tone for a payment status (soft chip). */
export const STATUS_TONE: Record<PaymentStatus, "success" | "warning" | "error"> = {
	paid: "success",
	partial: "warning",
	unpaid: "error",
};

/** Display label (e.g. «#1042» / «#1039-R1») for a transaction. */
export const txNumber = (tx: Pick<TransactionRecord, "transactionNumber" | "id">): string =>
	`#${tx.transactionNumber ?? tx.id}`;
