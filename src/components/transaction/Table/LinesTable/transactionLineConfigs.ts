import { Column } from "components/shared/Table/DataTable/DataTable";
import i18next from "i18n/config";
import { TransactionLine } from "models/transaction";

export const transactionLineColumns: Column<TransactionLine>[] = [
	{
		key: "product-name",
		field: "productName",
		headerName: i18next.t("transaction.line.product"),
		sortable: true,
		width: "35%",
		align: "left",
		renderCell: (line) => line.productName,
	},
	{
		key: "unit-price",
		field: "unitPrice",
		headerName: i18next.t("transaction.line.quantity"),
		sortable: true,
		width: "25%",
		align: "right",
		renderCell: (line) => line.unitPrice.toLocaleString(),
	},
	{
		key: "quantity",
		field: "quantity",
		headerName: i18next.t("transaction.line.quantity"),
		sortable: true,
		width: "15%",
		align: "right",
		renderCell: (line) => line.quantity,
	},
	{
		key: "total",
		field: "total",
		headerName: i18next.t("transaction.line.total"),
		sortable: false,
		width: "25%",
		align: "right",
		renderCell: (line) => line.total.toLocaleString(),
	},
];
