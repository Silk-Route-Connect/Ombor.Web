import { PaymentCurrency, PaymentMethod } from "./payment";

export type CreatePayrollRequest = {
	employeeId: number;
	amount: number;
	date: string;
	currency: PaymentCurrency;
	method: PaymentMethod;
	exchangeRate?: number;
	notes?: string;
};
