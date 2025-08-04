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

export type TableMode = "full" | "compact";

export type TransactionColumn =
	| "id"
	| "date"
	| "partnerName"
	| "totalDue"
	| "totalPaid"
	| "unpaidAmount"
	| "status"
	| "notes";

export type ColumnBuilder = (mode: "full" | "compact") => Column<TransactionRecord>;

const CURRENCY_COLUMN_WIDTH = "clamp(150px, 20%, 170px)";

export const TRANSACTION_COLUMN_WIDTHS: Record<
	TableMode,
	Partial<Record<TransactionColumn, string>>
> = {
	full: {
		id: "clamp(60px, 10%, 120px)",
		date: "clamp(80px, 10%, 100px)",
		partnerName: "clamp(80px, 10%, 100px)",
		totalDue: CURRENCY_COLUMN_WIDTH,
		totalPaid: CURRENCY_COLUMN_WIDTH,
		unpaidAmount: CURRENCY_COLUMN_WIDTH,
		status: "clamp(90px, 10%, 120px)",
		notes: "auto",
	},

	compact: {
		id: "clamp(80px, 25%,  100px)",
		date: "clamp(80px, 25%, 100px)",
		totalDue: CURRENCY_COLUMN_WIDTH,
		totalPaid: CURRENCY_COLUMN_WIDTH,
		status: "clamp(100px, 15%, 130px)",
	},
};

export const TransactionColumnBuilders: Record<TransactionColumn, ColumnBuilder> = {
	id: (mode) => ({
		key: "id",
		field: "id",
		width: TRANSACTION_COLUMN_WIDTHS[mode]["id"],
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

	date: (mode) => ({
		key: "date",
		field: "date",
		width: TRANSACTION_COLUMN_WIDTHS[mode]["date"],
		headerName: translate("fieldDate"),
		align: "left",
		sortable: true,
		renderCell: (transaction) => formatDateTime(transaction.date),
	}),

	partnerName: (mode) => ({
		key: "partnerName",
		field: "partnerName",
		width: TRANSACTION_COLUMN_WIDTHS[mode]["partnerName"],
		headerName: translate("transaction.partner"),
		sortable: true,
		renderCell: (transaction) => (
			<PartnerLink id={transaction.partnerId} name={transaction.partnerName} />
		),
	}),

	totalDue: (mode) => ({
		key: "totalDue",
		field: "totalDue",
		width: TRANSACTION_COLUMN_WIDTHS[mode]["totalDue"],
		headerName: translate("transaction.totalDue"),
		align: "right",
		sortable: true,
		renderCell: (transaction) => formatPrice(transaction.totalDue),
	}),

	totalPaid: (mode) => ({
		key: "totalPaid",
		field: "totalPaid",
		width: TRANSACTION_COLUMN_WIDTHS[mode]["totalPaid"],
		headerName: translate("transaction.totalPaid"),
		align: "right",
		sortable: true,
		renderCell: (transaction) => formatPrice(transaction.totalPaid),
	}),

	unpaidAmount: (mode) => ({
		key: "unpaidAmount",
		width: TRANSACTION_COLUMN_WIDTHS[mode]["unpaidAmount"],
		headerName: translate("transaction.unpaid"),
		align: "right",
		sortable: true,
		renderCell: (transaction) => formatPrice(transaction.totalDue - transaction.totalPaid),
	}),

	status: (mode) => ({
		key: "status",
		field: "status",
		width: TRANSACTION_COLUMN_WIDTHS[mode]["status"],
		headerName: translate("transaction.status"),
		align: "center",
		sortable: true,
		renderCell: (transaction) => (
			<Chip
				size="small"
				label={translate(`transaction.status.${transaction.status}`)}
				color={TRANSACTION_STATUS_COLORS[transaction.status]}
				variant="outlined"
			/>
		),
	}),

	notes: (mode) => ({
		key: "notes",
		field: "notes",
		width: TRANSACTION_COLUMN_WIDTHS[mode]["notes"],
		headerName: translate("transaction.notes"),
		renderCell: (transaction) => formatNotes(transaction.notes),
	}),
};
