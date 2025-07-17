import { PaymentCurrency, PaymentMethod } from "./payment";

export type TransactionType = "Sale" | "Supply" | "SaleRefund" | "SupplyRefund";

export type TransactionStatus = "Open" | "Closed";

export type GetTransactionsRequest = {
	searchTerm?: string | null;
	type?: TransactionType | null;
	partnerId?: number | null;
	status?: TransactionStatus | null;
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
	payments: TransactionPayment[];
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

export type TransactionPayment = {
	amount: number;
	method: PaymentMethod;
	currency: PaymentCurrency;
	exchangeRate: number;
};
