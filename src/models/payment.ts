export type PaymentCurrency = "UZS" | "USD" | "RUB";

export type PaymentMethod = "Cash" | "Card" | "BankTransfer";

export type PaymentDirection = "Income" | "Expense";

export type PaymentType = "Transaction" | "Deposit" | "Withdrawal" | "Payroll" | "General";

export type PaymentAllocationType = "Sale" | "Supply" | "SaleRefund" | "SupplyRefund";

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
	allocations: PaymentAllocation[];
};

export type PaymentAllocation = {
	id: number;
	transactionId?: number;
	appliedAmount: number;
	type: PaymentAllocationType;
};
