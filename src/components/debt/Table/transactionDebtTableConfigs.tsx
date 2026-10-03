import React from "react";
import PartnerLink from "components/partner/Links/PartnerLink";
import StatusPill from "components/shared/Chip/StatusPill";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import EntityCell from "components/shared/Table/cells/EntityCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { TransactionTypeBadge } from "components/transaction/TransactionBadges";
import { TFunction } from "i18next";
import { Debt } from "models/debt";
import { saleDetailPath, supplyDetailPath } from "routing/paths";
import { numericSx } from "theme";
import { entityNumberSortValue } from "utils/formatEntityId";
import { directionOf, isRefundType } from "utils/transactionUtils";

import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box } from "@mui/material";

export type DebtRow = Debt & { id: number };

/** The source document number — the served one, else the id (DR-14). */
export const debtDocumentNumber = (d: Debt): string | number => d.number ?? d.transactionId;

export const debtDocumentPath = (d: Debt): string =>
	d.transactionType === "Supply" || d.transactionType === "SupplyRefund"
		? supplyDetailPath(d.transactionId)
		: saleDetailPath(d.transactionId);

/**
 * By-document debt columns in the canonical order (conventions.md → Tables):
 * № · Дата · Партнёр · Тип · Возраст · Итого · Оплачено · Остаток. «Остаток» is
 * the main amount, coloured by who owes whom.
 */
export function buildTransactionDebtColumns(t: TFunction): Column<DebtRow>[] {
	return [
		{
			key: "document",
			headerName: t("debt.txTable.document"),
			sortValue: (d) => entityNumberSortValue(debtDocumentNumber(d)),
			renderCell: (d) => <DocNumberCell number={debtDocumentNumber(d)} to={debtDocumentPath(d)} />,
		},
		{
			key: "date",
			headerName: t("debt.txTable.date"),
			sortValue: (d) => Date.parse(d.date),
			renderCell: (d) => <DateCell value={d.date} />,
		},
		{
			key: "partner",
			headerName: t("debt.txTable.partner"),
			sortValue: (d) => d.partnerName,
			renderCell: (d) => (
				<EntityCell secondary={d.partnerCompany}>
					<PartnerLink id={d.partnerId} name={d.partnerName} />
				</EntityCell>
			),
		},
		{
			key: "type",
			headerName: t("debt.txTable.type"),
			// Key off the actual type (incl. refunds) so the sort order matches the
			// badge label — direction alone would file «Возврат поставки» under Sale.
			sortValue: (d) =>
				t(
					isRefundType(d.transactionType)
						? `transaction.badge.refund.${directionOf(d.transactionType)}`
						: `transaction.badge.base.${directionOf(d.transactionType)}`,
				),
			renderCell: (d) => <TransactionTypeBadge type={d.transactionType} />,
		},
		{
			key: "age",
			headerName: t("debt.txTable.age"),
			sortValue: (d) => d.ageDays,
			renderCell: (d) => (
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
					<Box
						component="span"
						sx={{ ...numericSx, color: "text.secondary", whiteSpace: "nowrap" }}
					>
						{t("debt.ageDays", { days: d.ageDays })}
					</Box>
					{d.overdueDays > 0 && (
						<StatusPill
							token="overdue"
							icon={ReportProblemOutlinedIcon}
							label={t("debt.overdueChip", { days: d.overdueDays })}
						/>
					)}
				</Box>
			),
		},
		{
			key: "total",
			headerName: t("debt.txTable.total"),
			align: "right",
			sortValue: (d) => d.total,
			renderCell: (d) => <MoneyCell value={d.total} />,
		},
		{
			key: "paid",
			headerName: t("debt.txTable.paid"),
			align: "right",
			sortValue: (d) => d.paid,
			renderCell: (d) => <MoneyCell value={d.paid} />,
		},
		{
			key: "remaining",
			headerName: t("debt.txTable.remaining"),
			align: "right",
			sortValue: (d) => d.remaining,
			renderCell: (d) => (
				<MoneyCell
					value={d.remaining}
					main
					tone={d.direction === "Receivable" ? "income" : "expense"}
				/>
			),
		},
	];
}
