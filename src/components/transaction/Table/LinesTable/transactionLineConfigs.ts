import { Column } from "components/shared/DataTable/DataTable";
import { translate } from "i18n/i18n";
import { TransactionLine } from "models/transaction";

export const transactionLineColumns: Column<TransactionLine>[] = [
	{
		key: "product-name",
		field: "productName",
		headerName: translate("transaction.line.product"),
		sortable: true,
		width: "35%",
		align: "left",
		renderCell: (line) => line.productName,
	},
	{
		key: "unit-price",
		field: "unitPrice",
		headerName: translate("transaction.line.quantity"),
		sortable: true,
		width: "25%",
		align: "right",
		renderCell: (line) => line.unitPrice.toLocaleString(),
	},
	{
		key: "quantity",
		field: "quantity",
		headerName: translate("transaction.line.quantity"),
		sortable: true,
		width: "15%",
		align: "right",
		renderCell: (line) => line.quantity,
	},
	{
		key: "total",
		field: "total",
		headerName: translate("transaction.line.total"),
		sortable: false,
		width: "25%",
		align: "right",
		renderCell: (line) => line.total.toLocaleString(),
	},
];
