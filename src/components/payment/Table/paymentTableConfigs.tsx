import { Column } from "components/shared/Table/DataTable/DataTable";
import i18next from "i18n/config";
import { Payment } from "models/payment";
import { formatNotes } from "utils/stringUtils";

export const paymentColumns: Column<Payment>[] = [
	{
		key: "payment-number",
		field: "id",
		headerName: i18next.t("payment.number"),
		sortable: true,
		width: "10%",
	},
	{
		key: "date",
		field: "date",
		headerName: i18next.t("payment.date"),
		sortable: true,
		width: "15%",
		renderCell: (row) => new Date(row.date).toLocaleString("ru-RU"),
	},
	{
		key: "partner",
		field: "partnerName",
		headerName: i18next.t("payment.partner"),
		sortable: true,
		width: "20%",
		renderCell: (row) => row.partnerName,
	},
	{
		key: "direction",
		field: "direction",
		headerName: i18next.t("payment.direction"),
		sortable: true,
		width: "10%",
		renderCell: (p) => i18next.t(`payment.direction.${p.direction}`),
	},
	{
		key: "type",
		field: "type",
		headerName: i18next.t("payment.type"),
		sortable: true,
		width: "10%",
		renderCell: (p) => i18next.t(`payment.type.${p.type}`),
	},
	{
		key: "amount",
		field: "amount",
		headerName: i18next.t("payment.amount"),
		sortable: true,
		width: "15%",
		align: "right",
		renderCell: (p) => p.amount.toLocaleString(),
	},
	{
		key: "notes",
		field: "notes",
		headerName: i18next.t("payment.notes"),
		sortable: true,
		width: "15%",
		renderCell: (p) => formatNotes(p.notes, 30),
	},
];
