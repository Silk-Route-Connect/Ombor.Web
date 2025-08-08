import { Column } from "components/shared/ExpandableDataTable/ExpandableDataTable";
import { translate } from "i18n/i18n";
import { Template } from "models/template";
import { calculateTemplateTotals } from "utils/templateUtils";

export const templateTableColumns: Column<Template>[] = [
	{
		key: "name",
		field: "name",
		headerName: translate("template.name"),
		sortable: true,
		width: "30%",
	},
	{
		key: "partnerName",
		field: "partnerName",
		headerName: translate("template.partner"),
		sortable: true,
		width: "20%",
	},
	{
		key: "type",
		field: "type",
		headerName: translate("template.type"),
		sortable: true,
		width: "20%",
		renderCell: (template) => translate(`template.type.${template.type}`),
	},
	{
		key: "total",
		field: "total",
		headerName: translate("template.total"),
		sortable: true,
		width: "20%",
		renderCell: (template) => calculateTemplateTotals(template.items).totalDue.toLocaleString(),
	},
];
