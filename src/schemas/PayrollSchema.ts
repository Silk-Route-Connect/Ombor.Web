import i18next from "i18n/config";
import { ALL_PAYMENT_CURRENCIES } from "models/payment";
import { PAYROLL_PAYMENT_METHODS } from "models/payroll";
import { z } from "zod";

const requiredEnum = <T extends readonly string[]>(values: T, key: string) =>
	z.custom<T[number]>((v) => typeof v === "string" && (values as readonly string[]).includes(v), {
		message: i18next.t(key),
	});

export const PayrollSchema = z.object({
	employeeId: z.number().positive(i18next.t("payroll.validation.employeeRequired")),

	amount: z.number().positive(i18next.t("payment.validation.amountPositive")),

	currency: requiredEnum(ALL_PAYMENT_CURRENCIES, "payment.validation.currencyInvalid"),

	method: requiredEnum(PAYROLL_PAYMENT_METHODS, "payment.validation.methodInvalid"),

	exchangeRate: z
		.number()
		.positive(i18next.t("payment.validation.exchangeRatePositive"))
		.optional(),

	notes: z.string().max(500, i18next.t("payment.validation.notesTooLong")).optional(),
});

export type PayrollFormInputs = z.input<typeof PayrollSchema>;
export type PayrollFormValues = z.output<typeof PayrollSchema>;
