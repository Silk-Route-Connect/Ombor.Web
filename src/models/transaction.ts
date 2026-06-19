import { SettlementInput } from "./payment";

export type TransactionType = "Sale" | "Supply" | "SaleRefund" | "SupplyRefund";

export type TransactionStatus = "Open" | "Closed" | "PartiallyPaid" | "Overdue";

/** Derived payment state shown on the redesign list/detail (rule: computed from total vs paid). */
export type PaymentStatus = "paid" | "partial" | "unpaid";

/** A line discount is either a percentage or a fixed amount (business-rules §E, rules 37–38). */
export type TransactionLineDiscountType = "pct" | "fixed";

export type GetTransactionsRequest = {
	searchTerm?: string | null;
	type?: TransactionType | null;
	partnerId?: number | null;
	statuses?: TransactionStatus[];
};

/** A payment row shown on the transaction detail (simplified view of an allocation). */
export type TransactionPaymentLine = {
	id: string;
	date: string;
	/** Localized method label, e.g. «Наличные». */
	method: string;
	amount: number;
};

export type TransactionAttachment = {
	name: string;
	kind: "pdf" | "img";
	size: string;
};

export type TransactionRecord = {
	id: number;
	partnerId: number;
	partnerName: string;
	notes?: string;
	date: Date;
	transactionNumber?: string;
	totalDue: number;
	totalPaid: number;
	type: TransactionType;
	status: TransactionStatus;
	lines: TransactionLine[];

	/* ── Redesign enrichment served by the v1 mock (optional so the legacy
	   create flow keeps compiling against the same type). ── */
	/** Time-of-day "HH:mm" for the detail header. */
	time?: string;
	warehouseName?: string;
	createdBy?: string;
	/** Backend-derived payment status (paid/partial/unpaid). */
	paymentStatus?: PaymentStatus;
	/** Outstanding amount (totalDue − totalPaid). */
	remaining?: number;
	/** For refunds: the original transaction this reverses. */
	originalTransactionId?: number;
	originalTransactionNumber?: string;
	/** For refunds: the mandatory reason (business-rules rule 7). */
	refundReason?: string;
	/** Payments allocated to this transaction (detail view). */
	payments?: TransactionPaymentLine[];
	attachments?: TransactionAttachment[];
};

export type TransactionLine = {
	id: number;
	productId: number;
	productName: string;
	transactionId: number;
	unitPrice: number;
	quantity: number;
	/** Net line amount after the line discount. */
	total: number;
	/** Discount value: percent when discountType is "pct", currency amount when "fixed", 0 = none. */
	discount: number;
	/** Measurement short label (e.g. «кг», «шт») — redesign. */
	unit?: string;
	/** Whether `discount` is a percentage or a fixed amount — redesign. */
	discountType?: TransactionLineDiscountType;
};

/** One line of a refund-creation request (references a product of the original transaction). */
export type CreateRefundLine = {
	productId: number;
	productName: string;
	quantity: number;
	unitPrice: number;
};

/** Refund-creation payload (POST /api/transactions/{id}/refund). */
export type CreateRefundRequest = {
	reason: string;
	lines: CreateRefundLine[];
};

/* ─────────────────── Redesigned POS New Sale / New Supply ───────────────────
 * The redesigned full-page New Sale and New Supply (one component, parameterized
 * by direction) create via `POST /api/transactions` as **multipart/form-data**:
 * a single `payload` part carrying the JSON below (everything except files) plus
 * zero or more `attachments` file parts (the structured body is too nested to
 * flatten into form fields, and JSON alone can't carry binaries — full contract
 * in the POST handler's CONTRACT block). Source/allocation handling follows business-rules
 * §B: one Wallet source, this transaction's TransactionSettlement, optional
 * other-open-transaction settlements, and the disposition of any remaining
 * excess (ChangeReturn memo or AdvanceCredit, rule 40). */

/** Disposition of payment excess remaining after the transaction + settlements. */
export type OverpaymentDisposition = "change" | "advance";

/** One product line of a New Sale/Supply (discount is % or fixed amount — rules 37–38). */
export type CreateTransactionEntryLine = {
	productId: number;
	quantity: number;
	unitPrice: number;
	/** Discount value: percent when discountType is "pct", currency amount when "fixed". */
	discount: number;
	discountType: TransactionLineDiscountType;
};

export type CreateTransactionEntryRequest = {
	/** Sale (goods out) or Supply (goods in) — selects pricing, stock rules, signs. */
	direction: "Sale" | "Supply";
	partnerId: number;
	warehouseId: number;
	lines: CreateTransactionEntryLine[];
	notes?: string;
	/** Wallet the money moves through (always present; amount may be 0). */
	walletId: number;
	/** Amount tendered through the wallet. 0 ⇒ a full-credit transaction (deliberate). */
	paidAmount: number;
	/** Excess allocated to the partner's other open transactions (settlement modal). */
	settlements: SettlementInput[];
	/** What to do with the excess left after the transaction + settlements (rule 40). */
	overpayment: OverpaymentDisposition;
	/** Files sent as multipart `attachments` parts (the server stores the binaries). */
	attachments?: File[];
};
