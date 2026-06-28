import React from "react";
import { useTranslation } from "react-i18next";
import PartnerLink from "components/partner/Links/PartnerLink";
import { PaymentDirectionBadge, PaymentTypeBadge } from "components/payment/PaymentPresentation";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import WalletLink from "components/wallet/Links/WalletLink";
import { Loadable } from "helpers/Loading";
import { TFunction } from "i18next";
import { PaymentRecord } from "models/payment";
import { numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box, Paper, Typography } from "@mui/material";

interface PaymentsTableProps {
	rows: Loadable<PaymentRecord[]>;
	isFiltering: boolean;
	onOpen: (payment: PaymentRecord) => void;
}

/** Keep an inner entity link from also triggering the row's open-detail click. */
const stop = (e: React.MouseEvent) => e.stopPropagation();

const Muted: React.FC = () => (
	<Box component="span" sx={{ color: "text.disabled" }}>
		—
	</Box>
);

/**
 * Payments list columns (canonical order: № → date → party → type chip →
 * direction chip → касса → money right). Every column is sortable; payments are
 * immutable, so there is no actions column — a row opens the full-page detail.
 * Partner + Касса are {@link DetailLink} wrappers (the row is also clickable; the
 * links stop propagation). Amounts are unsigned — colour carries the direction.
 */
function buildPaymentColumns(t: TFunction): Column<PaymentRecord>[] {
	return [
		{
			key: "number",
			headerName: t("payment.table.number"),
			// The backend's legacy DTO omits the human «P-…» number — fall back to «№id»
			// so the column is never blank (matches the detail-page title).
			sortValue: (p) => p.number || `№${p.id}`,
			renderCell: (p) => (
				<Box component="span" sx={{ ...numericSx, fontWeight: 700, color: "primary.main" }}>
					{p.number || `№${p.id}`}
				</Box>
			),
		},
		{
			key: "date",
			headerName: t("payment.table.date"),
			sortValue: (p) => new Date(p.date),
			renderCell: (p) => (
				<Box component="span" sx={{ ...numericSx, color: "text.secondary", whiteSpace: "nowrap" }}>
					{formatDate(p.date)}
				</Box>
			),
		},
		{
			key: "party",
			headerName: t("payment.table.party"),
			sortValue: (p) => p.partnerName ?? p.employeeName ?? "",
			renderCell: (p) =>
				p.partnerId != null && p.partnerName ? (
					<Box component="span" sx={{ fontWeight: 600 }} onClick={stop}>
						<PartnerLink id={p.partnerId} name={p.partnerName} />
					</Box>
				) : p.employeeName ? (
					<Box component="span" sx={{ fontWeight: 600 }}>
						{p.employeeName}
					</Box>
				) : (
					<Muted />
				),
		},
		{
			key: "type",
			headerName: t("payment.table.type"),
			sortValue: (p) => p.type,
			renderCell: (p) => <PaymentTypeBadge type={p.type} />,
		},
		{
			key: "direction",
			headerName: t("payment.table.direction"),
			sortValue: (p) => p.direction,
			renderCell: (p) => <PaymentDirectionBadge direction={p.direction} />,
		},
		{
			key: "wallet",
			headerName: t("payment.table.wallet"),
			sortValue: (p) => p.walletName,
			renderCell: (p) => (
				<Box
					component="span"
					onClick={stop}
					sx={{
						display: "inline-flex",
						alignItems: "center",
						gap: "7px",
						whiteSpace: "nowrap",
					}}
				>
					<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
					<WalletLink id={p.walletId} name={p.walletName} />
				</Box>
			),
		},
		{
			key: "amount",
			headerName: t("payment.table.amount"),
			align: "right",
			sortValue: (p) => p.amount,
			renderCell: (p) => (
				<Box
					component="span"
					sx={{
						...numericSx,
						fontWeight: 700,
						fontSize: 15,
						color: p.direction === "Income" ? "success.main" : "error.main",
					}}
				>
					{formatCurrency(p.amount)}
				</Box>
			),
		},
	];
}

/**
 * Payments list on the shared {@link DataTable} (warm bands, client-side sort,
 * pagination). Loading + populated states are the table's; the rich, filter-aware
 * empty state is rendered here instead of the table's bare placeholder.
 */
export const PaymentsTable: React.FC<PaymentsTableProps> = ({ rows, isFiltering, onOpen }) => {
	const { t } = useTranslation();

	if (rows !== "loading" && rows.length === 0) {
		return (
			<Paper
				elevation={1}
				sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
			>
				<Box sx={{ p: "52px 24px 58px", textAlign: "center" }}>
					<Box
						sx={{
							width: 56,
							height: 56,
							borderRadius: 2,
							mx: "auto",
							mb: 2,
							display: "grid",
							placeItems: "center",
							bgcolor: "grey.50",
							border: 1,
							borderColor: "divider",
							color: "text.disabled",
						}}
					>
						<ReceiptLongOutlinedIcon sx={{ fontSize: 26 }} />
					</Box>
					<Typography variant="h2" sx={{ mb: 0.75 }}>
						{isFiltering ? t("payment.empty.searchTitle") : t("payment.empty.title")}
					</Typography>
					<Typography
						variant="body2"
						sx={{ color: "text.secondary", maxWidth: 400, mx: "auto", lineHeight: 1.6 }}
					>
						{isFiltering ? t("payment.empty.searchBody") : t("payment.empty.body")}
					</Typography>
				</Box>
			</Paper>
		);
	}

	return (
		<DataTable
			rows={rows}
			columns={buildPaymentColumns(t)}
			pagination
			defaultSort={{ key: "date", order: "desc" }}
			onRowClick={onOpen}
		/>
	);
};

export default PaymentsTable;
