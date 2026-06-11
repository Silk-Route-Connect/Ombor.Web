import i18next from "i18n/config";
import { TEMPLATE_TYPES, TemplateType } from "models/template";
import { z } from "zod";

export const TemplateTypeSchema = z.custom<TemplateType>(
	(value) => typeof value === "string" && (TEMPLATE_TYPES as readonly string[]).includes(value),
	{ message: i18next.t("template.validation.typeInvalid") },
);

const TemplateItemSchema = z.object({
	id: z.number().nonnegative(),

	productName: z.string().min(1),

	productId: z.number().int().min(1, i18next.t("template.validation.productIdInvalid")),

	quantity: z.number().int().min(1, i18next.t("template.validation.quantityInvalid")),

	unitPrice: z.number().gt(0, i18next.t("template.validation.unitPriceInvalid")),

	discount: z
		.number()
		.min(0, i18next.t("template.validation.discountMin"))
		.max(100, i18next.t("template.validation.discountMax")),
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
