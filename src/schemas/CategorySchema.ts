import i18next from "i18n/config";
import { z } from "zod";

export const CategorySchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, i18next.t("category.validation.name.required"))
		.max(100, i18next.t("category.validation.name.tooLong")),
	description: z
		.string()
		.trim()
		.max(500, i18next.t("category.validation.description.tooLong"))
		.nullable(),
});

export type CategoryFormInputs = z.input<typeof CategorySchema>;
export type CategoryFormValues = z.output<typeof CategorySchema>;
