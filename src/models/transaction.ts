import { PaymentCurrency, PaymentMethod } from "./payment";

export type TransactionType = "Sale" | "Supply" | "SaleRefund" | "SupplyRefund";

export type TransactionStatus = "Open" | "Closed" | "PartiallyPaid";

export type GetTransactionsRequest = {
	searchTerm?: string | null;
	type?: TransactionType | null;
	partnerId?: number | null;
	statuses?: TransactionStatus[];
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
};

export type TransactionLine = {
	id: number;
	productId: number;
	productName: string;
	transactionId: number;
	unitPrice: number;
	quantity: number;
	total: number;
	discount: number;
};

export type CreateTransactionRequest = {
	partnerId: number;
	type: TransactionType;
	lines: CreateTransactionLine[];
	payments: TransactionPaymentRecord[];
	debtPayments?: DebtPayment[];
	notes?: string;
	attachments?: File[];
};

export type CreateTransactionLine = {
	productId: number;
	unitPrice: number;
	quantity: number;
	discount: number;
};

export type DebtPayment = {
	transactionId: number;
	amount: number;
};

export type TransactionPaymentRecord = {
	amount: number;
	method: PaymentMethod;
	currency: PaymentCurrency;
	exchangeRate: number;
};
