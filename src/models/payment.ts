export type PaymentCurrency = "UZS" | "USD" | "RUB";

export type PaymentMethod = "Cash" | "Card" | "BankTransfer" | "AccountBalance";

export type PaymentDirection = "Income" | "Expense";

export type PaymentType = "Transaction" | "Deposit" | "Withdrawal" | "Payroll" | "General";

export type PaymentAllocationType =
	| "Sale"
	| "Supply"
	| "SaleRefund"
	| "SupplyRefund"
	| "AdvancePayment";

export type Payment = {
	id: number;
	partnerId?: number;
	notes?: string;
	externalReference?: string;
	amount: number;
	amountLocal: number;
	exchangeRate: number;
	date: Date;
	direction: PaymentDirection;
	currency: PaymentCurrency;
	type: PaymentType;
	method: PaymentMethod;
	allocations: PaymentAllocation[];
};

export type PaymentAllocation = {
	id: number;
	transactionId?: number;
	appliedAmount: number;
	type: PaymentAllocationType;
};

export type CreatePaymentRequest = {
	partnerId?: number;
	notes?: string;
	externalReference?: string;
	amount: number;
	exchangeRate: number;
	date: Date;
	direction: PaymentDirection;
	currency: PaymentCurrency;
	type: PaymentType;
	method: PaymentMethod;
	attachments?: File[];
};

export type TransactionPayment = {
	paymentId: number;
	transactionId: number;
	amount: number;
	date: Date;
	currency: PaymentCurrency;
	method: PaymentMethod;
	notes?: string;
};

export type CreateTransactionPaymentRequest = {
	transactionId: number;
	amount: number;
	method: PaymentMethod;
	currency: PaymentCurrency;
	exchangeRate: number;
	notes?: string;
	attachments?: File[];
};

export type GetPaymentsRequest = {
	type?: PaymentType;
};
