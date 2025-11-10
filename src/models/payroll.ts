import { ALL_PAYMENT_METHODS, PaymentCurrency, PaymentMethod } from "./payment";

export const PAYROLL_PAYMENT_METHODS = ALL_PAYMENT_METHODS.filter(
	(method) => method !== "AccountBalance",
);

export type CreatePayrollRequest = {
	employeeId: number;
	amount: number;
	currency: PaymentCurrency;
	method: PaymentMethod;
	exchangeRate?: number;
	notes?: string;
};

export type UpdatePayrollRequest = {
	employeeId: number;
	paymentId: number;
	amount: number;
	currency: PaymentCurrency;
	method: PaymentMethod;
	exchangeRate?: number;
	notes?: string;
};

export type DeletePayrollRequest = {
	paymentId: number;
	employeeId: number;
};

export type GetPayrollByIdRequest = {
	paymentId: number;
	employeeId: number;
};

export type GetPayrollHistoryRequest = {
	employeeId: number;
};
