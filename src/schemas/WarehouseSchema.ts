import { translate } from "i18n/i18n";
import { z } from "zod";

export const WarehouseSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, translate("warehouse.validation.nameRequired"))
		.max(100, translate("warehouse.validation.nameTooLong")),

	location: z
		.string()
		.trim()
		.max(200, translate("warehouse.validation.locationTooLong"))
		.nullable()
		.optional(),

	isActive: z.boolean(),
});

export type WarehouseFormInputs = z.input<typeof WarehouseSchema>;
export type WarehouseFormValues = z.output<typeof WarehouseSchema>;
