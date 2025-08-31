import React from "react";
import {
	AccountBalance,
	Category,
	CreditCard,
	LocalAtm,
	SwapHoriz,
	Work,
} from "@mui/icons-material";
import { Chip, Tooltip, Typography, useTheme } from "@mui/material";
import { Column, DataTable, SortOrder } from "components/shared/DataTable/DataTable";
import PartnerLink from "components/shared/Links/PartnerLink";
import { Loadable } from "helpers/Loading";
import { translate } from "i18n/i18n";
import { Payment, PaymentDirection, PaymentType } from "models/payment";
import { formatDateTime } from "utils/dateUtils";

interface PaymentsTableProps {
	payments: Loadable<Payment[]>;
	onPaymentClick?: (payment: Payment) => void;
	onSort?: (field: keyof Payment, order: SortOrder) => void;
	pagination?: boolean;
}

const MAX_NOTES_LENGTH = 25;

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
	payments,
	onPaymentClick,
	onSort,
	pagination = true,
}) => {
	const theme = useTheme();

	const renderNotes = (notes?: string): React.ReactNode => {
		if (!notes) {
			return translate("common.dash");
		}

		if (notes.length <= MAX_NOTES_LENGTH) {
			return notes;
		}

		const truncatedNotes = notes.substring(0, MAX_NOTES_LENGTH) + "...";

		return (
			<Tooltip title={notes} placement="top" arrow>
				<Typography component="span" sx={{ cursor: "help" }}>
					{truncatedNotes}
				</Typography>
			</Tooltip>
		);
	};

	const renderPartner = (payment: Payment): React.ReactNode => {
		if (!payment.partnerId || !payment.partnerName) {
			return translate("common.dash");
		}

		return <PartnerLink id={payment.partnerId} name={payment.partnerName} />;
	};

	const getDirectionColor = (direction: PaymentDirection) => {
		return direction === "Income" ? theme.palette.success.main : theme.palette.error.main;
	};

	const renderDirection = (direction: PaymentDirection): React.ReactNode => {
		return (
			<Chip
				label={translate(`payment.direction.${direction}`)}
				size="small"
				sx={{
					backgroundColor: `${getDirectionColor(direction)}15`,
					color: getDirectionColor(direction),
					border: `1px solid ${getDirectionColor(direction)}40`,
					fontWeight: 500,
				}}
			/>
		);
	};

	const getTypeIcon = (type: PaymentType) => {
		switch (type) {
			case "Transaction":
				return <SwapHoriz />;
			case "Deposit":
				return <AccountBalance />;
			case "Withdrawal":
				return <LocalAtm />;
			case "Payroll":
				return <Work />;
			case "General":
				return <Category />;
			default:
				return <CreditCard />;
		}
	};

	const renderType = (type: PaymentType): React.ReactNode => {
		return (
			<Chip
				icon={getTypeIcon(type)}
				label={translate(`payment.type.${type}`)}
				variant="outlined"
				size="small"
				sx={{
					backgroundColor: theme.palette.grey[50],
					borderColor: theme.palette.grey[300],
					"& .MuiChip-icon": {
						color: theme.palette.text.secondary,
					},
				}}
			/>
		);
	};

	const columns: Column<Payment>[] = [
		{
			key: "id",
			field: "id",
			headerName: translate("payment.number"),
			width: "10%",
			align: "left",
			sortable: true,
			renderCell: (payment) => `#${payment.id}`,
		},
		{
			key: "date",
			field: "date",
			headerName: translate("payment.date"),
			width: "15%",
			align: "left",
			sortable: true,
			renderCell: (payment) => formatDateTime(payment.date),
		},
		{
			key: "partner",
			headerName: translate("payment.partner"),
			width: "15%",
			align: "left",
			sortable: true,
			renderCell: renderPartner,
		},
		{
			key: "amount",
			field: "amount",
			headerName: translate("payment.amount"),
			width: "15%",
			align: "right",
			sortable: true,
			renderCell: (payment) => payment.amount.toLocaleString(),
		},
		{
			key: "direction",
			field: "direction",
			headerName: translate("payment.direction"),
			width: "10%",
			align: "center",
			sortable: true,
			renderCell: (payment) => renderDirection(payment.direction),
		},
		{
			key: "type",
			field: "type",
			headerName: translate("payment.type"),
			width: "10%",
			align: "center",
			sortable: true,
			renderCell: (payment) => renderType(payment.type),
		},
		{
			key: "notes",
			field: "notes",
			headerName: translate("payment.notes"),
			width: "20%",
			align: "left",
			sortable: true,
			renderCell: (payment) => renderNotes(payment.notes),
		},
	];

	return (
		<DataTable
			rows={payments}
			columns={columns}
			pagination={pagination}
			onRowClick={onPaymentClick}
			onSort={onSort}
		/>
	);
};

export default PaymentsTable;
