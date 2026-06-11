import { Column } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import i18next from "i18n/config";
import { Template } from "models/template";
import { calculateTemplateTotals } from "utils/templateUtils";

export const templateTableColumns: Column<Template>[] = [
	{
		key: "name",
		field: "name",
		headerName: i18next.t("template.name"),
		sortable: true,
		width: "25%",
	},
	{
		key: "partnerName",
		field: "partnerName",
		headerName: i18next.t("template.partner"),
		sortable: true,
		width: "30%",
	},
	{
		key: "type",
		field: "type",
		headerName: i18next.t("template.type"),
		sortable: true,
		width: "15%",
		renderCell: (template) => i18next.t(`template.type.${template.type}`),
	},
	{
		key: "total",
		field: "total",
		headerName: i18next.t("template.total"),
		sortable: true,
		width: "30%",
		renderCell: (template) => calculateTemplateTotals(template.items).totalDue.toLocaleString(),
	},
];
