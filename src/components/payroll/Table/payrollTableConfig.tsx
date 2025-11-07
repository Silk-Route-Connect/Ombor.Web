import { Column } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import { translate } from "i18n/i18n";
import { Payment } from "models/payment";

import { Typography } from "@mui/material";

export const payrollColumns: Column<Payment>[] = [
	{
		key: "employeename",
		field: "employeeName",
		headerName: translate("payroll.employee"),
		sortable: true,
		width: "25%",
		renderCell: (payment: Payment) => payment.employeeName || translate("common.dash"),
	},
	{
		key: "amount",
		field: "amount",
		headerName: translate("payment.amount"),
		sortable: true,
		width: "15%",
		renderCell: (payment: Payment) => payment.amount.toLocaleString(),
	},
	{
		key: "date",
		field: "date",
		headerName: translate("payment.date"),
		sortable: true,
		width: "15%",
		renderCell: (payment: Payment) => new Date(payment.date).toLocaleDateString(),
	},
	{
		key: "currency",
		field: "components",
		headerName: translate("payment.currency"),
		sortable: false,
		width: "10%",
		renderCell: (payment: Payment) => payment.components[0]?.currency || translate("common.dash"),
	},
	{
		key: "method",
		field: "components",
		headerName: translate("payment.method"),
		sortable: false,
		width: "15%",
		renderCell: (payment: Payment) =>
			payment.components[0]?.method
				? translate(`payment.method.${payment.components[0].method}`)
				: translate("common.dash"),
	},
	{
		key: "notes",
		field: "notes",
		headerName: translate("payment.notes"),
		sortable: false,
		width: "15%",
		renderCell: (payment: Payment) => (
			<Typography
				variant="body2"
				sx={{
					maxWidth: 200,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				}}
			>
				{payment.notes || "—"}
			</Typography>
		),
	},
];
