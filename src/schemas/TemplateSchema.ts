import i18next from "i18n/config";
import { TEMPLATE_TYPES, TemplateType } from "models/template";
import { z } from "zod";

export const TemplateTypeSchema = z.custom<TemplateType>(
	(value) => typeof value === "string" && (TEMPLATE_TYPES as readonly string[]).includes(value),
	{ message: i18next.t("template.validation.typeInvalid") },
);

const TemplateItemSchema = z
	.object({
		id: z.number().nonnegative(),

		productName: z.string().min(1),

		productId: z.number().int().min(1, i18next.t("template.validation.productIdInvalid")),

		quantity: z.number().int().min(1, i18next.t("template.validation.quantityInvalid")),

		unitPrice: z.number().gt(0, i18next.t("template.validation.unitPriceInvalid")),

		discount: z.number().min(0, i18next.t("template.validation.discountMin")),

		// Served on every line; every appended/loaded line carries it, so it is
		// required here (no `.default()`, which would split z.input from z.output).
		discountType: z.enum(["Percentage", "Fixed"]),

		// Read-only pack snapshot carried through the form so a pack item survives an
		// edit round-trip (F21); the modal has no pack control. null = base-unit item.
		packageSize: z.number().int().positive().nullable().optional(),
	})
	// The «≤ 100» cap only applies to percentage discounts; a fixed-amount discount
	// (e.g. 5 000 UZS) is a currency value and must not be clamped to 100.
	.refine((item) => item.discountType !== "Percentage" || item.discount <= 100, {
		path: ["discount"],
		message: i18next.t("template.validation.discountMax"),
	});

export const TemplateSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, i18next.t("template.validation.nameRequired"))
		.max(100, i18next.t("template.validation.nameTooLong")),

	partnerId: z.number().int().min(1, i18next.t("template.validation.partnerInvalid")),

	type: TemplateTypeSchema,

	items: z
		.array(TemplateItemSchema)
		.nonempty(i18next.t("template.validation.itemsRequired"))
		.refine(
			(items) => new Set(items.map((i) => i.productId)).size === items.length,
			i18next.t("template.validation.duplicateProduct"),
		),
});

export type TemplateFormInputs = z.input<typeof TemplateSchema>;
export type TemplateFormValues = z.output<typeof TemplateSchema>;
export type TemplateFormItemValues = z.output<typeof TemplateItemSchema>;
