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
 * One opening-stock line. A product is required; quantity and unit cost are
 * **non-negative** — unit cost may legitimately be 0 (free / sample stock, per
 * canon), and a negative value is the real failure (rule 18/22). A line only
 * counts toward the basket once its quantity is > 0 (enforced at submit, not
 * here, so an in-progress row isn't flagged prematurely).
 */
export const OpeningStockLineSchema = z.object({
	productId: z.number().int().positive(i18next.t("warehouse.opening.validation.productRequired")),
	quantity: z.number().min(0, i18next.t("warehouse.opening.validation.nonNegative")),
	unitCost: z.number().min(0, i18next.t("warehouse.opening.validation.nonNegative")),
});

/**
 * Opening-stock form contract: a single audited stock-in event scoped to a
 * warehouse, carrying one or more lines (business-rules rules 18/22). The note
 * is optional and rides along for the audit trail.
 */
export const OpeningStockSchema = z.object({
	items: z
		.array(OpeningStockLineSchema)
		.min(1, i18next.t("warehouse.opening.validation.linesRequired")),
	note: z
		.string()
		.trim()
		.max(500, i18next.t("warehouse.opening.validation.noteMax"))
		.transform((v) => (v === "" ? null : v))
		.nullable(),
});

export type OpeningStockFormInputs = z.input<typeof OpeningStockSchema>;
export type OpeningStockFormValues = z.output<typeof OpeningStockSchema>;
