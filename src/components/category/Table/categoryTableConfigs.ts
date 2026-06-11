import { Column } from "components/shared/Table/DataTable/DataTable";
import i18next from "i18n/config";
import { Category } from "models/category";

export const categoryTableColumns: Column<Category>[] = [
	{
		key: "name",
		field: "name",
		headerName: i18next.t("category.name"),
		width: "30%",
		sortable: true,
	},
	{
		key: "description",
		field: "description",
		headerName: i18next.t("category.description"),
		width: "60%",
		sortable: true,
	},
];
