import { Column } from "components/shared/Table/DataTable/DataTable";
import i18next from "i18n/config";
import { Product } from "models/product";

export const productColumns: Column<Product>[] = [
	{
		key: "sku",
		field: "sku",
		headerName: "Артикул",
		sortable: true,
		width: "10%",
	},
	{
		key: "name",
		field: "name",
		headerName: "Название",
		sortable: true,
		width: "15%",
	},
	{
		key: "category",
		field: "categoryName",
		headerName: "Категория",
		sortable: true,
		width: "15%",
	},
	{
		key: "type",
		field: "type",
		headerName: "Тип",
		sortable: true,
		width: "15%",
		renderCell: (p) => i18next.t(`product.type.${p.type}`),
	},
	{
		key: "salePrice",
		field: "salePrice",
		headerName: "Прод. цена",
		align: "right",
		sortable: true,
		width: "15%",
		renderCell: (p) => p.salePrice.toLocaleString(),
	},
	{
		key: "supplyPrice",
		field: "supplyPrice",
		headerName: "Зак. цена",
		align: "right",
		sortable: true,
		width: "15%",
		renderCell: (p) => p.supplyPrice.toLocaleString(),
	},
	{
		key: "retailPrice",
		field: "retailPrice",
		headerName: "Розн. цена",
		align: "right",
		sortable: true,
		width: "15%",
		renderCell: (p) => p.retailPrice.toLocaleString(),
	},
];
