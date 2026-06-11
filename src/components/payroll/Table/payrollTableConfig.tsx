import PaymentLink from "components/payment/Links/PaymentLink";
import { Column } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import i18next from "i18n/config";
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
		headerName: i18next.t("payroll.paymentId"),
		sortable: true,
		width: "15%",
		renderCell: (payment) => <PaymentLink id={payment.id} />,
	},

	employeeName: {
		key: "employeeName",
		field: "employeeName",
		headerName: i18next.t("employee.name"),
		sortable: true,
		width: "15%",
	},

	date: {
		key: "date",
		field: "date",
		headerName: i18next.t("payment.date"),
		sortable: true,
		width: "15%",
		renderCell: (payment) => formatDateTime(payment.date),
	},

	amount: {
		key: "amount",
		field: "amount",
		headerName: i18next.t("payment.amount"),
		sortable: true,
		align: "right",
		width: "15%",
		renderCell: (payment) => payment.amount.toLocaleString(),
	},

	currency: {
		key: "currency",
		field: "components",
		headerName: i18next.t("payment.currency"),
		width: "10%",
		renderCell: (payment) => payment.components[0]?.currency ?? i18next.t("common.dash"),
	},

	method: {
		key: "method",
		field: "components",
		headerName: i18next.t("payment.method"),
		width: "15%",
		renderCell: (payment) =>
			payment.components[0]?.method
				? i18next.t(`payment.method.${payment.components[0].method}`)
				: i18next.t("common.dash"),
	},

	notes: {
		key: "notes",
		field: "notes",
		headerName: i18next.t("payment.notes"),
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
				{payment.notes || i18next.t("common.dash")}
			</Typography>
		),
	},
} as const;
