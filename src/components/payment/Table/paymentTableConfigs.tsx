import { Column } from "components/shared/Table/DataTable/DataTable";
import { translate } from "i18n/i18n";
import { Payment } from "models/payment";
import { formatNotes } from "utils/stringUtils";

export const paymentColumns: Column<Payment>[] = [
	{
		key: "payment-number",
		field: "id",
		headerName: translate("payment.number"),
		sortable: true,
		width: "10%",
	},
	{
		key: "date",
		field: "date",
		headerName: translate("payment.date"),
		sortable: true,
		width: "15%",
		renderCell: (row) => new Date(row.date).toLocaleString("ru-RU"),
	},
	{
		key: "partner",
		field: "partnerName",
		headerName: translate("payment.partner"),
		sortable: true,
		width: "20%",
		renderCell: (row) => row.partnerName,
	},
	{
		key: "direction",
		field: "direction",
		headerName: translate("payment.direction"),
		sortable: true,
		width: "10%",
		renderCell: (p) => translate(`payment.direction.${p.direction}`),
	},
	{
		key: "type",
		field: "type",
		headerName: translate("payment.type"),
		sortable: true,
		width: "10%",
		renderCell: (p) => translate(`payment.type.${p.type}`),
	},
	{
		key: "amount",
		field: "amount",
		headerName: translate("payment.amount"),
		sortable: true,
		width: "15%",
		align: "right",
		renderCell: (p) => p.amount.toLocaleString(),
	},
	{
		key: "notes",
		field: "notes",
		headerName: translate("payment.notes"),
		sortable: true,
		width: "15%",
		renderCell: (p) => formatNotes(p.notes, 30),
	},
];
