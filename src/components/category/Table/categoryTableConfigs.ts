import { Column } from "components/shared/Table/DataTable/DataTable";
import { translate } from "i18n/i18n";
import { Category } from "models/category";

export const categoryTableColumns: Column<Category>[] = [
	{
		key: "name",
		field: "name",
		headerName: translate("category.name"),
		width: "30%",
		sortable: true,
	},
	{
		key: "description",
		field: "description",
		headerName: translate("category.description"),
		width: "60%",
		sortable: true,
	},
];
