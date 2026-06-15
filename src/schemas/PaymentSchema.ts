import i18next from "i18n/config";
import { z } from "zod";

/**
 * Create-payment form contract (business-rules §B). One schema across all five
 * payment types; per-type requirements are enforced with superRefine so each
 * type reads as a clean standalone form. The withdrawal over-advance check is
 * contextual (it depends on the live partner advance), so — like the Transfers
 * over-stock guard — it is enforced in the modal, not here. Settlement allocation
 * is a separate modal step (its own local state), not part of this schema.
 */
export const PaymentSchema = z
	.object({
		type: z.enum(["Transaction", "Deposit", "Withdrawal", "Payroll", "General"]),
		direction: z.enum(["Income", "Expense"]),
		partnerId: z.number().int().positive().nullable(),
		employeeId: z.number().int().positive().nullable(),
		walletId: z.number().int().positive().nullable(),
		amount: z.number().nonnegative(),
		description: z.string().trim().max(250),
		month: z.string(),
		year: z.string(),
	})
	.superRefine((v, ctx) => {
		const partnerTypes = ["Transaction", "Deposit", "Withdrawal"];

		if (partnerTypes.includes(v.type) && !v.partnerId) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["partnerId"],
				message: i18next.t("payment.validation.partnerRequired"),
			});
		}
		if (v.type === "Payroll" && !v.employeeId) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["employeeId"],
				message: i18next.t("payment.validation.employeeRequired"),
			});
		}
		if (!v.walletId) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["walletId"],
				message: i18next.t("payment.validation.walletRequired"),
			});
		}
		if (!(v.amount > 0)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["amount"],
				message: i18next.t("payment.validation.amountPositive"),
			});
		}
		if (v.type === "General" && v.description.trim() === "") {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["description"],
				message: i18next.t("payment.validation.descriptionRequired"),
			});
		}
	});

export type PaymentFormInputs = z.input<typeof PaymentSchema>;
export type PaymentFormValues = z.output<typeof PaymentSchema>;
