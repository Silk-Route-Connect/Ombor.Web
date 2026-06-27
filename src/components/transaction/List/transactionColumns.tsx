import React from "react";
import { Column } from "components/shared/Table/DataTable/DataTable";
import {
	TransactionStatusChip,
	TransactionTypeBadge,
} from "components/transaction/TransactionBadges";
import { TFunction } from "i18next";
import { TransactionRecord } from "models/transaction";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { isRefundType } from "utils/transactionUtils";

import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { Box, Typography } from "@mui/material";

export function buildTransactionColumns(t: TFunction): Column<TransactionRecord>[] {
	return [
		{
			key: "date",
			headerName: t("transaction.col.date"),
			renderCell: (tx) => (
				<Box
					component="span"
					sx={{ ...numericSx, color: designTokens.gray700, whiteSpace: "nowrap" }}
				>
					{formatDate(tx.date)}
				</Box>
			),
		},
		{
			key: "number",
			headerName: t("transaction.col.number"),
			renderCell: (tx) => {
				const refund = isRefundType(tx.type);
				return (
					<Box>
						<Box
							component="span"
							sx={{
								...numericSx,
								fontWeight: 700,
								color: refund ? designTokens.gray700 : "primary.main",
							}}
						>
							#{tx.transactionNumber ?? tx.id}
						</Box>
						{refund && tx.originalTransactionNumber && (
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: "4px",
									mt: "3px",
									fontSize: 11.5,
									color: "text.disabled",
								}}
							>
								<UndoOutlinedIcon sx={{ fontSize: 12 }} />
								{t("transaction.list.refundOf", { number: tx.originalTransactionNumber })}
							</Box>
						)}
					</Box>
				);
			},
		},
		{
			key: "type",
			headerName: t("transaction.col.type"),
			renderCell: (tx) => <TransactionTypeBadge type={tx.type} />,
		},
		{
			key: "partner",
			headerName: t("transaction.col.partner"),
			renderCell: (tx) => (
				<Typography component="span" sx={{ fontWeight: 600, color: "primary.main" }}>
					{tx.partnerName}
				</Typography>
			),
		},
		{
			key: "positions",
			headerName: t("transaction.col.positions"),
			align: "right",
			renderCell: (tx) => (
				<Box component="span" sx={{ ...numericSx, color: "text.secondary" }}>
					{tx.lines.length}
				</Box>
			),
		},
		{
			key: "amount",
			headerName: t("transaction.col.amount"),
			align: "right",
			renderCell: (tx) => {
				const refund = isRefundType(tx.type);
				return (
					<Box
						component="span"
						sx={{
							...numericSx,
							fontWeight: 600,
							color: refund ? designTokens.gray700 : "text.primary",
						}}
					>
						{refund ? "−" : ""}
						{formatCurrency(tx.totalDue)}
					</Box>
				);
			},
		},
		{
			key: "status",
			headerName: t("transaction.col.status"),
			renderCell: (tx) =>
				isRefundType(tx.type) ? (
					<Box component="span" sx={{ color: "text.disabled" }}>
						—
					</Box>
				) : (
					<TransactionStatusChip status={tx.status} />
				),
		},
	];
}
