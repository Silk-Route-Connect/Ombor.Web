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
	switch (currency) {
		case "UZS":
			return "UZS (сўм)";
		case "USD":
			return "USD ($)";
		case "RUB":
			return "RUB (₽)";
		default:
			return currency;
	}
};
