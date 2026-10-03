import React from "react";
import PartnerLink from "components/partner/Links/PartnerLink";
import PaymentStatusChip from "components/shared/Chip/PaymentStatusChip";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import NoValue from "components/shared/Table/cells/NoValue";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { TransactionTypeBadge } from "components/transaction/TransactionBadges";
import { TFunction } from "i18next";
import { TransactionRecord } from "models/transaction";
import { saleDetailPath, supplyDetailPath } from "routing/paths";
import { entityNumberSortValue, formatEntityId } from "utils/formatEntityId";
import { directionOf, isRefundType } from "utils/transactionUtils";

import { Box } from "@mui/material";

/** The served document number; the lean list DTO may omit it — the id is its display number (DR-14). */
export const transactionDisplayNumber = (tx: TransactionRecord): string | number =>
	tx.transactionNumber ?? tx.id;

export const transactionDetailPath = (tx: TransactionRecord): string =>
	directionOf(tx.type) === "Supply" ? supplyDetailPath(tx.id) : saleDetailPath(tx.id);

/** Sort / CSV label of the type chip (refunds have their own label). */
export const transactionTypeLabel = (t: TFunction, tx: TransactionRecord): string =>
	t(
		isRefundType(tx.type)
			? `transaction.badge.refund.${directionOf(tx.type)}`
			: `transaction.badge.base.${directionOf(tx.type)}`,
	);

/**
 * Sales / Supplies feed columns in the canonical order (conventions.md →
 * Tables): № · Дата · Партнёр · Тип · Статус · Позиций · Сумма. Amounts are
 * unsigned — the type chip says «Возврат».
 */
export function buildTransactionColumns(t: TFunction): Column<TransactionRecord>[] {
	return [
		{
			key: "number",
			headerName: t("transaction.col.number"),
			sortValue: (tx) => entityNumberSortValue(transactionDisplayNumber(tx)),
			renderCell: (tx) => (
				<Box>
					<DocNumberCell number={transactionDisplayNumber(tx)} to={transactionDetailPath(tx)} />
					{isRefundType(tx.type) && tx.originalTransactionNumber && (
						<Box sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>
							{t("transaction.list.refundOf", {
								number: formatEntityId(tx.originalTransactionNumber),
							})}
						</Box>
					)}
				</Box>
			),
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
			renderCell: (tx) => <DateCell value={tx.date} />,
		},
		{
			key: "partner",
			headerName: t("transaction.col.partner"),
			sortValue: (tx) => tx.partnerName,
			renderCell: (tx) =>
				tx.partnerId ? <PartnerLink id={tx.partnerId} name={tx.partnerName} /> : tx.partnerName,
		},
		{
			key: "type",
			headerName: t("transaction.col.type"),
			sortValue: (tx) => transactionTypeLabel(t, tx),
			renderCell: (tx) => <TransactionTypeBadge type={tx.type} />,
		},
		{
			key: "status",
			headerName: t("transaction.col.status"),
			// Refunds carry no payment status — null groups them at one end.
			sortValue: (tx) => (isRefundType(tx.type) ? null : t(`transaction.statusShort.${tx.status}`)),
			renderCell: (tx) =>
				isRefundType(tx.type) ? <NoValue /> : <PaymentStatusChip status={tx.status} />,
		},
		{
			key: "positions",
			headerName: t("transaction.col.positions"),
			align: "right",
			sortValue: (tx) => tx.lines.length,
			renderCell: (tx) => <QuantityCell value={tx.lines.length} />,
		},
		{
			key: "amount",
			headerName: t("transaction.col.amount"),
			align: "right",
			sortValue: (tx) => tx.totalDue,
			renderCell: (tx) => <MoneyCell value={tx.totalDue} main />,
		},
	];
}
