import { Template, TemplateItem } from "models/template";
import { TemplateFormInputs, TemplateFormItemValues } from "schemas/TemplateSchema";

import { lineGross, lineNet } from "./transactionUtils";

export const TEMPLATE_FORM_DEFAULT_VALUES: TemplateFormInputs = {
	name: "",
	type: "Sale",
	partnerId: 0,
	items: [],
};

export const mapTemplateToPayload = (template: Template): TemplateFormInputs => {
	return {
		name: template.name,
		type: template.type,
		partnerId: template.partnerId,
		items: template.items,
	};
};

export function calculateTemplateTotals(items: TemplateItem[] | TemplateFormItemValues[]) {
	return items.reduce(
		(acc, item) => {
			const net = lineNet(item);
			acc.totalDiscount += lineGross(item) - net;
			acc.totalDue += net;
			return acc;
		},
		{ totalDue: 0, totalDiscount: 0 },
	);
}
