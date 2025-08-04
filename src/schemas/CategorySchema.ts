import { translate } from "i18n/i18n";
import { z } from "zod";

export const CategorySchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, translate("category.validation.name.required"))
		.max(100, translate("category.validation.name.tooLong")),
	description: z
		.string()
		.trim()
		.max(500, translate("category.validation.description.tooLong"))
		.optional(),
});

export type CategoryFormValues = z.infer<typeof CategorySchema>;
