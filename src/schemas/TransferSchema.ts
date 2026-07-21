import i18next from "i18n/config";
import { z } from "zod";

/**
 * Create-transfer form contract. Source and destination warehouses are required
 * and must differ; at least one line with a product and a positive quantity is
 * required. The per-line over-stock block (a line can't exceed the source
 * warehouse's availability — rule 20) is contextual (it needs live stock) and is
 * enforced in the form/store, not here.
 */
export const TransferLineSchema = z.object({
	productId: z.number().int().positive(i18next.t("transfer.validation.lineProductRequired")),
	quantity: z.number().positive(i18next.t("transfer.validation.lineQuantityPositive")),
});

export const TransferSchema = z
	.object({
		fromWarehouseId: z.number().int().positive(i18next.t("transfer.validation.fromRequired")),
		toWarehouseId: z.number().int().positive(i18next.t("transfer.validation.toRequired")),
		note: z
			.string()
			.trim()
			.max(500, i18next.t("transfer.validation.noteMax"))
			.transform((v) => (v === "" ? null : v))
			.nullable(),
		lines: z.array(TransferLineSchema).min(1, i18next.t("transfer.validation.linesRequired")),
	})
	.refine((d) => d.fromWarehouseId !== d.toWarehouseId, {
		message: i18next.t("transfer.validation.sameWarehouse"),
		path: ["toWarehouseId"],
	});

export type TransferFormInputs = z.input<typeof TransferSchema>;
export type TransferFormValues = z.output<typeof TransferSchema>;
