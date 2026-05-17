import { translate } from "i18n/i18n";
import { z } from "zod";

const StockTransferItemSchema = z.object({
	productId: z.number().int().min(1),

	productName: z.string().min(1),

	productSku: z.string(),

	availableQuantity: z.number().int().nonnegative(),

	quantity: z.number().int().min(1, translate("stockTransfer.validation.quantityMin")),

	destinationCurrentStock: z.number().int().nonnegative(),
});

export const StockTransferSchema = z
	.object({
		fromWarehouseId: z
			.number()
			.int()
			.min(1, translate("stockTransfer.validation.fromWarehouseRequired")),

		toWarehouseId: z
			.number()
			.int()
			.min(1, translate("stockTransfer.validation.toWarehouseRequired")),

		items: z
			.array(StockTransferItemSchema)
			.nonempty(translate("stockTransfer.validation.itemsRequired"))
			.refine(
				(items) => items.every((i) => i.quantity <= i.availableQuantity),
				translate("stockTransfer.validation.insufficientStock"),
			),

		notes: z
			.string()
			.trim()
			.max(500, translate("stockTransfer.validation.notesTooLong"))
			.nullable()
			.optional(),
	})
	.refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
		message: translate("stockTransfer.validation.sameWarehouse"),
		path: ["toWarehouseId"],
	});

export type StockTransferFormInputs = z.input<typeof StockTransferSchema>;
export type StockTransferFormValues = z.output<typeof StockTransferSchema>;
export type StockTransferItemValues = z.output<typeof StockTransferItemSchema>;
