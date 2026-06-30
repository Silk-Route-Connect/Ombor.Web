import i18next from "i18n/config";
import { z } from "zod";

import {
	ADJUSTMENT_DIRECTIONS,
	DECREASE_REASONS,
	INCREASE_REASONS,
} from "../models/stockAdjustment";

const ALL_REASONS = [...DECREASE_REASONS, ...INCREASE_REASONS] as const;

/**
 * Create-adjustment form contract. Warehouse, product, a positive quantity and a
 * reason are required; the note is optional. The over-stock block (a Decrease
 * cannot take stock below zero — rule 20) is contextual (it needs the live
 * per-warehouse availability) and is enforced in the form/store, not here.
 */
export const StockAdjustmentSchema = z.object({
	warehouseId: z.number().int().positive(i18next.t("adjustment.validation.warehouseRequired")),
	productId: z.number().int().positive(i18next.t("adjustment.validation.productRequired")),
	direction: z.enum(ADJUSTMENT_DIRECTIONS),
	// A negative value is the real failure (B10 — «Не может быть отрицательным»),
	// distinct from an empty / zero quantity (must be > 0). superRefine adds at
	// most one issue so the field shows the message that matches the input.
	quantity: z.number().superRefine((value, ctx) => {
		if (value < 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: i18next.t("adjustment.validation.nonNegative"),
			});
		} else if (value <= 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: i18next.t("adjustment.validation.quantityPositive"),
			});
		}
	}),
	// Empty until the user picks; the placeholder state is invalid (rule: mandatory
	// reason). Modelled as a string + membership check so "" is a valid form input.
	reason: z.string().refine((v) => (ALL_REASONS as readonly string[]).includes(v), {
		message: i18next.t("adjustment.validation.reasonRequired"),
	}),
	note: z
		.string()
		.trim()
		.max(500, i18next.t("adjustment.validation.noteMax"))
		.transform((v) => (v === "" ? null : v))
		.nullable(),
});

export type StockAdjustmentFormInputs = z.input<typeof StockAdjustmentSchema>;
export type StockAdjustmentFormValues = z.output<typeof StockAdjustmentSchema>;
