import { WalletType } from "./wallet";

export type PartnerType = "Customer" | "Supplier" | "Both";

export type Partner = {
	id: number;
	type: PartnerType;
	name: string;
	phoneNumbers: string[];
	address?: string;
	email?: string;
	telegram?: string;
	companyName?: string;
	/** Backend-computed net balance (UZS): + = partner owes us, − = we owe the partner. */
	balance: number;
	/** Opening-balance auditable event — signed amount, recorded once at creation. */
	openingBalance: number;
	/** ISO date the opening balance was recorded. */
	openingDate: string;
	/** Soft-archive flag (business-rules rule 29). */
	isArchived: boolean;
	/** True when no other entity references the partner, so it may be hard-deleted. */
	isDeletable: boolean;
	/** Count of ledger events beyond the opening balance (transactions + payments). */
	activityCount: number;
	/**
	 * Legacy advance/payable/receivable breakdown. Unused by the redesign (a single
	 * net balance + the ledger replace it); kept optional so legacy consumers compile.
	 */
	balanceDto?: PartnerBalance | null;
};

export type PartnerBalance = {
	total: number;
	partnerAdvance: number;
	companyAdvance: number;
	payableDebt: number;
	receivableDebt: number;
};

/** Settlement status of a transaction event in the partner ledger. */
export type PartnerLedgerStatus = "paid" | "partial" | "unpaid" | "done";

/** Every event type that can move a partner's balance (sign convention app-wide). */
export type PartnerLedgerEventType =
	| "opening"
	| "sale"
	| "supply"
	| "refund-sale"
	| "refund-supply"
	| "payment"
	| "deposit"
	| "withdraw";

/**
 * One row of the dispute-grade running-balance ledger — the record of "who owes
 * whom and why". Newest-first; the running balance reconciles exactly to the
 * partner's current computed balance (mvp-plan §7).
 */
export type PartnerLedgerEntry = {
	/** Stable key within the partner's ledger. */
	id: number;
	type: PartnerLedgerEventType;
	/**
	 * Id of the entity this row references — a transaction (sale/supply/refund-*) or a
	 * payment (payment/deposit/withdraw); null for opening. Drives row navigation.
	 */
	sourceId?: number | null;
	/** ISO date of the event. */
	date: string;
	/** Signed balance impact (UZS): + partner owes us, − we owe. */
	delta: number;
	/** Running balance after this event (UZS). */
	balance: number;
	/** Source-document reference, e.g. "#1042" (transaction) or "PAY-2061" (payment). */
	reference?: string;
	/** Line-item count (transactions only). */
	itemCount?: number;
	/** Settlement status (transactions only). */
	status?: PartnerLedgerStatus;
	/** Wallet the payment moved through — payment rows only; null on opening/transaction rows. */
	walletId?: number | null;
	walletName?: string | null;
	walletType?: WalletType | null;
};

export type CreatePartnerRequest = {
	type: PartnerType;
	name: string;
	companyName?: string;
	address?: string;
	email?: string;
	telegram?: string;
	phoneNumbers: string[];
	/** Signed opening balance (auditable event): + partner owes us, − we owe. */
	openingBalance: number;
};

/** Update never touches the opening balance — it is a locked audit event. */
export type UpdatePartnerRequest = {
	id: number;
	type: PartnerType;
	name: string;
	companyName?: string;
	address?: string;
	email?: string;
	telegram?: string;
	phoneNumbers: string[];
};
