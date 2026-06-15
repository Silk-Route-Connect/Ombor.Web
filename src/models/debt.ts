import { PartnerType } from "./partner";

/**
 * Debt — the «Долги» consolidated view. NOT a new entity: each row is an
 * unpaid / partially-paid transaction, surfaced as an outstanding amount
 * (business-rules — receivable/payable debt definitions). The page is a
 * read-only, aggregated view; debts are produced by transactions, never created
 * directly. Every figure (remaining, age, overdue) is server-computed and served
 * (hard rule 8 / rule 12).
 *
 * Direction:
 *  - Receivable — the partner owes us (unpaid Sale / SupplyRefund).
 *  - Payable   — we owe the partner (unpaid Supply / SaleRefund).
 */
export type DebtDirection = "Receivable" | "Payable";

export type DebtTransactionType = "Sale" | "Supply" | "SaleRefund" | "SupplyRefund";

export type Debt = {
	/** The source transaction id. */
	transactionId: number;
	/** Human number shown as «#1042». */
	number: number;
	direction: DebtDirection;
	transactionType: DebtTransactionType;

	partnerId: number;
	partnerName: string;
	/** Optional company / sub-label under the partner name. */
	partnerCompany: string | null;
	partnerType: PartnerType;

	/** ISO transaction date. */
	date: string;
	/** ISO due date (date + payment terms). */
	dueDate: string;

	total: number;
	paid: number;
	/** Served outstanding amount (total − paid). */
	remaining: number;
	/** Served age in days since the transaction date. */
	ageDays: number;
	/** Served days past the due date; > 0 means overdue. */
	overdueDays: number;
};
