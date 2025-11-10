import PaymentLink from "components/payment/Links/PaymentLink";
import { Column } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import { translate } from "i18n/i18n";
import { Payment } from "models/payment";
import { formatDateTime } from "utils/dateUtils";

import { Typography } from "@mui/material";

export const PAYROLL_COLUMN_KEYS = [
	"paymentId",
	"employeeName",
	"date",
	"amount",
	"currency",
	"method",
	"notes",
] as const;

export type PayrollColumnKey = (typeof PAYROLL_COLUMN_KEYS)[number];

export const PAYROLL_COLUMNS: Record<PayrollColumnKey, Column<Payment>> = {
	paymentId: {
		key: "id",
		field: "id",
		headerName: translate("payroll.paymentId"),
		sortable: true,
		width: "15%",
		renderCell: (payment) => <PaymentLink id={payment.id} />,
	},

	employeeName: {
		key: "employeeName",
		field: "employeeName",
		headerName: translate("employee.name"),
		sortable: true,
		width: "15%",
	},

	date: {
		key: "date",
		field: "date",
		headerName: translate("payment.date"),
		sortable: true,
		width: "15%",
		renderCell: (payment) => formatDateTime(payment.date),
	},

	amount: {
		key: "amount",
		field: "amount",
		headerName: translate("payment.amount"),
		sortable: true,
		align: "right",
		width: "15%",
		renderCell: (payment) => payment.amount.toLocaleString(),
	},

	currency: {
		key: "currency",
		field: "components",
		headerName: translate("payment.currency"),
		width: "10%",
		renderCell: (payment) => payment.components[0]?.currency ?? translate("common.dash"),
	},

	method: {
		key: "method",
		field: "components",
		headerName: translate("payment.method"),
		width: "15%",
		renderCell: (payment) =>
			payment.components[0]?.method
				? translate(`payment.method.${payment.components[0].method}`)
				: translate("common.dash"),
	},

	notes: {
		key: "notes",
		field: "notes",
		headerName: translate("payment.notes"),
		width: "25%",
		renderCell: (payment) => (
			<Typography
				variant="body2"
				sx={{
					maxWidth: 250,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				}}
			>
				{payment.notes || translate("common.dash")}
			</Typography>
		),
	},
} as const;
