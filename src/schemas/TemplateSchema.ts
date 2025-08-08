import { translate } from "i18n/i18n";
import { TEMPLATE_TYPES, TemplateType } from "models/template";
import { z } from "zod";

export const TemplateTypeSchema = z.custom<TemplateType>(
	(value) => typeof value === "string" && (TEMPLATE_TYPES as readonly string[]).includes(value),
	{ message: translate("template.validation.typeInvalid") },
);

const TemplateItemSchema = z.object({
	id: z.number().nonnegative(),

	productName: z.string().min(1),

	productId: z.number().int().min(1, translate("template.validation.productIdInvalid")),

	quantity: z.number().int().min(1, translate("template.validation.quantityInvalid")),

	unitPrice: z.number().gt(0, translate("template.validation.unitPriceInvalid")),

	discount: z
		.number()
		.min(0, translate("template.validation.discountMin"))
		.max(100, translate("template.validation.discountMax")),
});

export const TemplateSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, translate("template.validation.nameRequired"))
		.max(100, translate("template.validation.nameTooLong")),

	partnerId: z.number().int().min(1, translate("template.validation.partnerInvalid")),

	type: TemplateTypeSchema,

	items: z
		.array(TemplateItemSchema)
		.nonempty(translate("template.validation.itemsRequired"))
		.refine(
			(items) => new Set(items.map((i) => i.productId)).size === items.length,
			translate("template.validation.duplicateProduct"),
		),
});

export type TemplateFormInputs = z.input<typeof TemplateSchema>;
export type TemplateFormValues = z.output<typeof TemplateSchema>;
export type TemplateFormItemValues = z.output<typeof TemplateItemSchema>;
