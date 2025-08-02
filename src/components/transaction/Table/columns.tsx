import { Chip } from "@mui/material";
import { Column } from "components/shared/ExpandableDataTable/ExpandableDataTable";
import PartnerLink from "components/shared/Links/PartnerLink";
import TransactionLink from "components/shared/Links/TransactionLink";
import { TRANSACTION_STATUS_COLORS } from "constants/index";
import { translate } from "i18n/i18n";
import { TransactionRecord } from "models/transaction";
import { formatDateTime } from "utils/dateUtils";
import { formatNotes } from "utils/stringUtils";
import { formatPrice } from "utils/supplyUtils";

import TransactionMenuCell from "./MenuCell/TransactionMenuCell";

export type TransactionColumn =
	| "id"
	| "date"
	| "partnerName"
	| "totalDue"
	| "totalPaid"
	| "unpaidAmount"
	| "status"
	| "notes"
	| "menu";

type ColumnBuilder = (width?: string, mode?: "full" | "compact") => Column<TransactionRecord>;

export const transactionColumns: Record<TransactionColumn, ColumnBuilder> = {
	id: (width, mode) => ({
		key: "id",
		field: "id",
		width: width,
		headerName: translate("transaction.id"),
		renderCell: (transaction) =>
			mode === "full" ? (
				<>
					{translate(`transaction.type.${transaction.type}`)} #{transaction.id}
				</>
			) : (
				<TransactionLink id={transaction.id} type={transaction.type} />
			),
	}),

	date: (width) => ({
		key: "date",
		field: "date",
		width: width,
		headerName: translate("fieldDate"),
		align: "left",
		renderCell: (transaction) => formatDateTime(transaction.date),
	}),

	partnerName: (width) => ({
		key: "partnerName",
		field: "partnerName",
		width: width,
		headerName: translate("transaction.partner"),
		renderCell: (transaction) => (
			<PartnerLink id={transaction.partnerId} name={transaction.partnerName} />
		),
	}),

	totalDue: (width) => ({
		key: "totalDue",
		field: "totalDue",
		width: width,
		headerName: translate("transaction.totalDue"),
		align: "right",
		renderCell: (transaction) => formatPrice(transaction.totalDue),
	}),

	totalPaid: (width) => ({
		key: "totalPaid",
		field: "totalPaid",
		width: width,
		headerName: translate("transaction.totalPaid"),
		align: "right",
		renderCell: (transaction) => formatPrice(transaction.totalPaid),
	}),

	unpaidAmount: (width) => ({
		key: "unpaidAmount",
		width: width,
		headerName: translate("transaction.unpaid"),
		align: "right",
		renderCell: (transaction) => formatPrice(transaction.totalDue - transaction.totalPaid),
	}),

	status: (width) => ({
		key: "status",
		field: "status",
		width: width,
		headerName: translate("transaction.status"),
		align: "center",
		renderCell: (transaction) => (
			<Chip
				size="small"
				label={translate(`transaction.status.${transaction.status}`)}
				color={TRANSACTION_STATUS_COLORS[transaction.status]}
				variant="outlined"
			/>
		),
	}),

	notes: (width) => ({
		key: "notes",
		field: "notes",
		width: width,
		headerName: translate("transaction.notes"),
		renderCell: (transaction) => formatNotes(transaction.notes),
	}),

	menu: (width) => ({
		key: "menu",
		width: width,
		headerName: "",
		renderCell: (transaction) => (
			<TransactionMenuCell
				fullyPaid={transaction.status === "Open"}
				onPayment={() => {}}
				onRefund={() => {}}
			/>
		),
	}),
};
