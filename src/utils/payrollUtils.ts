import { translate } from "i18n/i18n";
import { ALL_PAYMENT_CURRENCIES, PaymentCurrency } from "models/payment";
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
