import i18next from "i18n/config";
import { z } from "zod";

/**
 * Warehouse create/edit form contract — aligned to the redesigned modal: only
 * Название is required; Адрес is optional free text. Creating a warehouse never
 * moves stock — it is created empty and stocked later via the opening-stock
 * flow (business-rules rule 22).
 */
export const WarehouseSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, i18next.t("warehouse.validation.nameMin"))
		.max(250, i18next.t("warehouse.validation.nameMax")),
	location: z
		.string()
		.trim()
		.max(250, i18next.t("warehouse.validation.locationMax"))
		.transform((v) => (v === "" ? null : v))
		.nullable(),
});

export type WarehouseFormInputs = z.input<typeof WarehouseSchema>;
export type WarehouseFormValues = z.output<typeof WarehouseSchema>;

/**
 * Opening-stock form contract: an audited stock-in event scoped to a warehouse
 * (business-rules rule 22). Product, quantity and unit cost are required and
 * strictly positive (negative / zero stock-in is meaningless); the note is
 * optional and rides along for the audit trail.
 */
export const OpeningStockSchema = z.object({
	productId: z.number().int().positive(i18next.t("warehouse.opening.validation.productRequired")),
	quantity: z.number().positive(i18next.t("warehouse.opening.validation.quantityPositive")),
	unitCost: z.number().positive(i18next.t("warehouse.opening.validation.costPositive")),
	note: z
		.string()
		.trim()
		.max(500, i18next.t("warehouse.opening.validation.noteMax"))
		.transform((v) => (v === "" ? null : v))
		.nullable(),
});

export type OpeningStockFormInputs = z.input<typeof OpeningStockSchema>;
export type OpeningStockFormValues = z.output<typeof OpeningStockSchema>;
