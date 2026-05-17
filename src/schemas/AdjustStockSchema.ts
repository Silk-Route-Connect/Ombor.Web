import { translate } from "i18n/i18n";
import { z } from "zod";

const AdjustStockItemSchema = z.object({
	productId: z.number().int().min(1, translate("warehouse.validation.productRequired")),

	productName: z.string().min(1),

	currentQuantity: z.number().int().nonnegative(),

	newQuantity: z.number().int().nonnegative(translate("warehouse.validation.quantityNonNegative")),

	lowStockThreshold: z
		.number()
		.int()
		.nonnegative(translate("warehouse.validation.thresholdNonNegative"))
		.optional(),
});

export const AdjustStockSchema = z.object({
	items: z
		.array(AdjustStockItemSchema)
		.nonempty(translate("warehouse.validation.itemsRequired"))
		.refine(
			(items) => items.some((i) => i.newQuantity !== i.currentQuantity),
			translate("warehouse.validation.noChanges"),
		),

	notes: z.string().trim().min(10, translate("warehouse.validation.notesMinLength")),
});

export type AdjustStockFormInputs = z.input<typeof AdjustStockSchema>;
export type AdjustStockFormValues = z.output<typeof AdjustStockSchema>;
export type AdjustStockItemValues = z.output<typeof AdjustStockItemSchema>;
