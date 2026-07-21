import i18next from "i18n/config";
import { z } from "zod";

/** Payroll create form — UZS-only, wallet-sourced, period-tagged (rule 9). */
export const PayrollSchema = z.object({
	employeeId: z.number().positive(i18next.t("payroll.validation.employeeRequired")),

	walletId: z.number().positive(i18next.t("payroll.validation.walletRequired")),

	amount: z.number().positive(i18next.t("payment.validation.amountPositive")),

	/** Backend period token «YYYY-MM». */
	period: z.string().regex(/^\d{4}-\d{2}$/, i18next.t("payroll.validation.periodRequired")),

	notes: z.string().max(500, i18next.t("payment.validation.notesTooLong")).optional(),
});

export type PayrollFormInputs = z.input<typeof PayrollSchema>;
export type PayrollFormValues = z.output<typeof PayrollSchema>;
