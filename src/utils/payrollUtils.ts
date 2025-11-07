import { translate } from "i18n/i18n";
import { ALL_PAYMENT_CURRENCIES, Payment, PaymentCurrency } from "models/payment";
import { PayrollFormValues } from "schemas/PayrollSchema";

export const PAYROLL_FORM_DEFAULT_VALUES: PayrollFormValues = {
	amount: 0,
	date: new Date().toISOString().split("T")[0],
	currency: "UZS",
	method: "Cash",
	exchangeRate: 1,
	notes: "",
};

export const getCurrencyLabel = (currency: string): string => {
	if (ALL_PAYMENT_CURRENCIES.includes(currency as PaymentCurrency)) {
		return translate(`currency.${currency}`);
	}

	return currency;
};

export const mapPaymentToFormValues = (payment: Payment): PayrollFormValues => {
	if (!payment.components || payment.components.length === 0) {
		throw new Error("Payment must have at least one component");
	}

	const component = payment.components[0];
	const method = component?.method || "Cash";

	return {
		amount: payment.amount,
		date: payment.date.split("T")[0],
		currency: component?.currency || "UZS",
		method: method === "AccountBalance" ? "Cash" : method,
		exchangeRate: component?.exchangeRate || 1,
		notes: payment.notes || "",
	};
};
