import { PaymentCurrency, PaymentMethod } from "./payment";

export type TransactionType = "Sale" | "Supply" | "SaleRefund" | "SupplyRefund";

export type TransactionStatus = "Open" | "Closed";

export type GetTransactionsRequest = {
	searchTerm?: string;
	type?: TransactionType;
	partnerId?: number;
	status?: TransactionStatus;
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
	notes?: string;
	totalPaid: number;
	exchangeRate: number;
	paymentType: PaymentCurrency;
	paymentMethod: PaymentMethod;
	lines: CreateTransactionLine[];
	attachments?: File[];
};

export type CreateTransactionLine = {
	productId: number;
	unitPrice: number;
	quantity: number;
	discount: number;
};
