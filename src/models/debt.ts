import { PartnerType } from "./partner";

/**
 * An unpaid document — one row of the «Долги» page's «Неоплаченные документы»
 * list: an unpaid / partially-paid transaction with its outstanding amount. Its
 * sums are document totals, not debt: an advance the partner holds is not
 * netted here — debt totals come from {@link DebtSummary} (business-rules
 * «Debt totals»). Every figure (remaining, age, overdue) is served (hard rule 8).
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
	/** Human document label, e.g. «S-1024» (provisional — display-only); null if unset. */
	number: string | null;
	direction: DebtDirection;
	transactionType: DebtTransactionType;

	partnerId: number;
	partnerName: string;
	/** Optional company / sub-label under the partner name. */
	partnerCompany: string | null;
	partnerType: PartnerType;

	/** ISO transaction date. */
	date: string;
	/** ISO due date; null when due on receipt (then overdueDays is 0). */
	dueDate: string | null;

	total: number;
	paid: number;
	/** Served outstanding amount (total − paid). */
	remaining: number;
	/** Served age in days since the transaction date. */
	ageDays: number;
	/** Served days past the due date; > 0 means overdue. */
	overdueDays: number;
};

/**
 * Who owes whom, organization-wide (`GET /api/debts/summary`) — the one source
 * of every «Нам должны» / «Мы должны» figure on Partners, «Долги» and the
 * dashboard: net partner positions (opening + unpaid documents ± advances),
 * archived partners included (business-rules «Debt totals», rule 31).
 */
export type DebtSummary = {
	/** Σ positive partner balances — what partners owe us. */
	receivable: number;
	receivablePartnerCount: number;
	/** Σ |negative partner balances| — what we owe. */
	payable: number;
	payablePartnerCount: number;
	/** receivable − payable. */
	net: number;
	/** The part of `receivable` aged 31+ days. */
	olderThan30Days: number;
	/** `receivable` by age; sums to `receivable`. */
	aging: DebtAgingBucket[];
	/** Totals over the unpaid documents (not netted by advances). */
	unpaidDocuments: DebtDocumentTotals;
	/** Every partner with a non-zero balance or an unpaid document, largest amount first. */
	partners: DebtPartnerPosition[];
};

export type DebtAgingBucket = {
	bucket: "0-7" | "8-30" | "31-60" | "60+";
	amount: number;
};

/** Sums of the unpaid-documents list. */
export type DebtDocumentTotals = {
	receivable: number;
	receivableCount: number;
	payable: number;
	payableCount: number;
	/** Remaining of unpaid documents past their due date, both directions («Просрочено»). */
	pastDue: number;
	pastDueCount: number;
};

/** «Settled»: unpaid documents fully netted by an advance — nobody owes. */
export type DebtPositionDirection = DebtDirection | "Settled";

/** One partner's position — what its balance is made of. */
export type DebtPartnerPosition = {
	partnerId: number;
	name: string;
	company: string | null;
	partnerType: PartnerType;
	isArchived: boolean;
	direction: DebtPositionDirection;
	/** Signed net balance (positive = owes us); equals `Partner.balance`. */
	balance: number;
	/** |balance|. */
	amount: number;
	/** Signed, included in `balance`. */
	openingBalance: number;
	unpaidReceivable: number;
	unpaidPayable: number;
	unpaidDocumentCount: number;
	/** Advance the partner paid that we hold (lowers what it owes). */
	partnerAdvance: number;
	/** Advance we paid the partner (raises what it owes). */
	companyAdvance: number;
	/** Age of the oldest part of what it owes us; null when it owes nothing. */
	oldestAgeDays: number | null;
};
