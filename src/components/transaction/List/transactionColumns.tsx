import React from "react";
import PartnerLink from "components/partner/Links/PartnerLink";
import CopyableNumberCell from "components/shared/Table/CopyableNumberCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import {
	TransactionStatusChip,
	TransactionTypeBadge,
} from "components/transaction/TransactionBadges";
import { TFunction } from "i18next";
import { TransactionRecord } from "models/transaction";
import { designTokens, numericSx } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { formatEntityId } from "utils/formatEntityId";
import { directionOf, isRefundType } from "utils/transactionUtils";

import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { Box } from "@mui/material";

/** Keep an inner entity link from also triggering the row's open-detail click. */
const stop = (e: React.MouseEvent) => e.stopPropagation();

/**
 * Sales/Supplies feed columns, in the locked column-order convention (№/ID →
 * date → type → primary entity → … → status): №, Дата, Тип, Партнёр, Позиций,
 * Сумма, Статус. Every column sorts (sortValue accessors — no plain `field`s
 * here since every cell renders).
 */
export function buildTransactionColumns(t: TFunction): Column<TransactionRecord>[] {
	return [
		{
			key: "number",
			headerName: t("transaction.col.number"),
			// Numeric id fallback (the lean list DTO omits `number`): a string id
			// would sort lexicographically («10» before «9»).
			sortValue: (tx) => tx.transactionNumber ?? tx.id,
			renderCell: (tx) => {
				const refund = isRefundType(tx.type);
				return (
					<Box>
						<CopyableNumberCell value={tx.transactionNumber ?? tx.id} muted={refund} />
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
								{t("transaction.list.refundOf", {
									number: formatEntityId(tx.originalTransactionNumber),
								})}
							</Box>
						)}
					</Box>
				);
			},
		},
		{
			key: "date",
			headerName: t("transaction.col.date"),
			// DataTable's desc sort is a stable asc sort + reverse(), which flips
			// equal-key ties — a refund would drop BELOW its same-timestamp original.
			// The +0.5 ms refund offset keeps the pair's keys distinct: asc puts the
			// original first, reverse lands the refund directly above it (the store's
			// feed order). 0.5 is exact in float64 and never overtakes another timestamp.
			sortValue: (tx) => tx.date.getTime() + (isRefundType(tx.type) ? 0.5 : 0),
			renderCell: (tx) => (
				<Box
					component="span"
					sx={{ ...numericSx, color: designTokens.gray700, whiteSpace: "nowrap" }}
				>
					{formatDateTime(tx.date)}
				</Box>
			),
		},
		{
			key: "type",
			headerName: t("transaction.col.type"),
			sortValue: (tx) =>
				t(
					isRefundType(tx.type)
						? `transaction.badge.refund.${directionOf(tx.type)}`
						: `transaction.badge.base.${directionOf(tx.type)}`,
				),
			renderCell: (tx) => <TransactionTypeBadge type={tx.type} />,
		},
		{
			key: "partner",
			headerName: t("transaction.col.partner"),
			sortValue: (tx) => tx.partnerName,
			renderCell: (tx) =>
				tx.partnerId ? (
					<Box component="span" sx={{ fontWeight: 600 }} onClick={stop}>
						<PartnerLink id={tx.partnerId} name={tx.partnerName} />
					</Box>
				) : (
					<Box component="span" sx={{ fontWeight: 600 }}>
						{tx.partnerName}
					</Box>
				),
		},
		{
			key: "positions",
			headerName: t("transaction.col.positions"),
			align: "right",
			sortValue: (tx) => tx.lines.length,
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
			// Signed so sorting is meaningful — refunds are negative money.
			sortValue: (tx) => (isRefundType(tx.type) ? -tx.totalDue : tx.totalDue),
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
			// Refunds carry no payment status — null groups them at one end.
			sortValue: (tx) => (isRefundType(tx.type) ? null : t(`transaction.statusShort.${tx.status}`)),
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
