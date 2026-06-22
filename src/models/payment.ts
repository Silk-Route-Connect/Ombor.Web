import { PartnerType } from "./partner";
import { WalletType } from "./wallet";

export type PaymentCurrency = "UZS" | "USD" | "RUB";

export type PaymentMethod = "Cash" | "Card" | "BankTransfer" | "AccountBalance";

export type PaymentDirection = "Income" | "Expense";

export type PaymentType = "Transaction" | "Deposit" | "Withdrawal" | "Payroll" | "General";

export const ALL_PAYMENT_CURRENCIES: PaymentCurrency[] = ["UZS", "USD", "RUB"];
export const ALL_PAYMENT_METHODS: PaymentMethod[] = [
	"Cash",
	"Card",
	"BankTransfer",
	"AccountBalance",
];

export type PaymentAllocationType =
	| "Sale"
	| "Supply"
	| "SaleRefund"
	| "SupplyRefund"
	| "AdvancePayment"
	| "ChangeReturn";

export type Payment = {
	id: number;
	partnerId?: number;
	partnerName?: string;
	employeeId?: number;
	employeeName?: string;
	notes?: string;
	amount: number;
	date: string;
	direction: PaymentDirection;
	type: PaymentType;
	components: PaymentComponent[];
	allocations: PaymentAllocation[];
};

export type PaymentComponent = {
	id: number;
	currency: PaymentCurrency;
	method: PaymentMethod;
	amount: number;
	exchangeRate: number;
};

export type PaymentAllocation = {
	id: number;
	transactionId?: number;
	amount: number;
	type: PaymentAllocationType;
};

export type CreatePaymentRequest = {
	partnerId?: number;
	notes?: string;
	externalReference?: string;
	amount: number;
	exchangeRate: number;
	date: string;
	direction: PaymentDirection;
	currency: PaymentCurrency;
	type: PaymentType;
	method: PaymentMethod;
	attachments?: File[];
};

/** The reshaped GET /transactions/{id}/payments line — wallet, not method (M2f). */
export type TransactionPayment = {
	id: number;
	transactionId: number;
	amount: number;
	paymentNumber: string;
	walletName: string;
	walletType: WalletType;
	notes?: string;
	date: string;
};

export type GetPaymentsRequest = {
	type?: PaymentType;
};

/* ───────────────────────── Redesigned «Платежи» module ─────────────────────────
 * The legacy DTO above (PaymentMethod / currency / exchangeRate) is the removed-enum
 * model, kept only for the still-legacy New Sale debt-payment flow. The redesigned
 * standalone Payments page is mocked at the target v1 contract (business-rules §B):
 * Wallet/Advance sources, canon allocation types, server-computed figures. PaymentType
 * and PaymentDirection above already match canon, so they are reused.
 */

/** Ordered list of payment types for filters and the create type selector. */
export const PAYMENT_TYPES: PaymentType[] = [
	"Transaction",
	"Deposit",
	"Withdrawal",
	"Payroll",
	"General",
];

/** Source side of a payment (business-rules rule 9). */
export type PaymentSourceType = "Wallet" | "Advance";

/** Destination side of a payment (business-rules rule 10). */
export type PaymentAllocationKind = "TransactionSettlement" | "AdvanceCredit" | "ChangeReturn";

/** One source component — where the money comes from. */
export type PaymentSource = {
	id: number;
	sourceType: PaymentSourceType;
	/** Set for Wallet sources; null for Advance sources (rule 11). */
	walletId: number | null;
	walletName: string | null;
	walletType: WalletType | null;
	amount: number;
};

/** One allocation — where the money goes. */
export type PaymentAllocationEntry = {
	id: number;
	allocationType: PaymentAllocationKind;
	/** Set for TransactionSettlement; null otherwise. The UI composes the label. */
	transactionId: number | null;
	/** Type of the settled transaction (routes the link); null for advance/change. */
	transactionType?: "Sale" | "Supply" | "SaleRefund" | "SupplyRefund" | null;
	amount: number;
};

/**
 * A standalone payment — the immutable Платёж record (rule 1). Every derived
 * figure (partner balance, wallet name) is served. Sources balance settling
 * allocations (rule 8); ChangeReturn sits outside that identity as a memo.
 */
export type PaymentRecord = {
	id: number;
	/** Human number, e.g. «P-520». */
	number: string;
	/** ISO date string. */
	date: string;
	type: PaymentType;
	direction: PaymentDirection;

	partnerId: number | null;
	partnerName: string | null;
	partnerType: PartnerType | null;

	employeeId: number | null;
	employeeName: string | null;
	employeePosition: string | null;

	/** Primary Wallet source (every standalone payment moves through one wallet). */
	walletId: number;
	walletName: string;
	walletType: WalletType;

	amount: number;
	/** Short allocation summary for the list, e.g. «к #1042, #1038» / «Аванс». */
	allocationSummary: string;

	/** General-payment description. */
	description: string | null;
	/** Payroll period, e.g. «Июнь 2026». */
	period: string | null;
	/** Payroll salary at payment time. */
	salary: number | null;

	createdBy: string;
	sources: PaymentSource[];
	allocations: PaymentAllocationEntry[];
};

/** An outstanding (unpaid / partially-paid) transaction — the settlement modal row. */
export type OutstandingTransaction = {
	id: number;
	/** ISO date string. */
	date: string;
	/** «Продажа» / «Поставка» (the transaction type, localized server-side label key). */
	type: "Sale" | "Supply";
	total: number;
	paid: number;
	remaining: number;
};

/** A partner option for the create modal — carries served balance + advance. */
export type PaymentPartnerRef = {
	id: number;
	name: string;
	type: PartnerType;
	/** Served partner balance (positive = receivable, negative = payable). */
	balance: number;
	/** Served advance held for the partner. */
	advance: number;
};

export type PaymentEmployeeRef = {
	id: number;
	name: string;
	position: string;
	salary: number;
};

export type PaymentWalletRef = {
	id: number;
	name: string;
	type: WalletType;
	balance: number;
};

/** Reference data for the create modal (served together). */
export type PaymentFormData = {
	partners: PaymentPartnerRef[];
	employees: PaymentEmployeeRef[];
	wallets: PaymentWalletRef[];
};

/** A single settlement allocation entered in the settlement modal. */
export type SettlementInput = {
	transactionId: number;
	amount: number;
};

/** Create-payment payload (target v1 contract). */
export type CreatePaymentRecordRequest = {
	type: PaymentType;
	direction: PaymentDirection;
	partnerId: number | null;
	employeeId: number | null;
	walletId: number;
	amount: number;
	/** General-payment description (required for General). */
	description: string | null;
	/** Payroll period «Июнь 2026» (required for Payroll). */
	period: string | null;
	/** Transaction-type settlement allocations; excess becomes an advance. */
	settlements: SettlementInput[];
};
