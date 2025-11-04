import { translate } from "i18n/i18n";
import { ALL_PAYMENT_CURRENCIES, ALL_PAYMENT_METHODS } from "models/payment";
import { z } from "zod";

const PAYMENT_METHODS = ALL_PAYMENT_METHODS.filter((method) => method !== "AccountBalance");

const requiredEnum = <T extends readonly string[]>(values: T, key: string) =>
	z.custom<T[number]>((v) => typeof v === "string" && (values as readonly string[]).includes(v), {
		message: translate(key),
	});

export const PayrollSchema = z.object({
	amount: z.number().positive(translate("payment.validation.amountPositive")),

	date: z.string().min(1, translate("payment.validation.dateRequired")),

	currency: requiredEnum(ALL_PAYMENT_CURRENCIES, "payment.validation.currencyInvalid"),

	method: requiredEnum(PAYMENT_METHODS, "payment.validation.methodInvalid"),

	exchangeRate: z
		.number()
		.positive(translate("payment.validation.exchangeRatePositive"))
		.optional(),

	notes: z.string().max(500, translate("payment.validation.notesTooLong")).optional(),
});

export type PayrollFormInputs = z.input<typeof PayrollSchema>;
export type PayrollFormValues = z.output<typeof PayrollSchema>;
