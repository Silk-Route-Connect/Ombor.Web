import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import PaymentStatusChip from "components/shared/Chip/PaymentStatusChip";
import DetailTable from "components/shared/Detail/DetailTable";
import DateCell from "components/shared/Table/cells/DateCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { TransactionTypeBadge } from "components/transaction/TransactionBadges";
import { DashboardRecentTransaction } from "models/dashboard";
import { radius } from "theme";

import { Box, Paper, Typography } from "@mui/material";

interface Props {
	rows: DashboardRecentTransaction[];
	onOpen: (tx: DashboardRecentTransaction) => void;
}

/**
 * «Последние продажи и поставки» — a read-only briefing of the latest documents
 * (no pager by design): Дата · Партнёр · Тип · Статус · Оплачено · Сумма. A row
 * (click, Enter or Space) opens the sale / supply. The served row carries
 * neither the document number nor the partner id, so there is no № column and
 * the partner is plain text (frontend-gaps follow-up).
 */
const RecentTransactionsTable: React.FC<Props> = ({ rows, onOpen }) => {
	const { t } = useTranslation();

	const columns = useMemo<Column<DashboardRecentTransaction>[]>(
		() => [
			{
				key: "date",
				headerName: t("dashboard.recent.date"),
				sortValue: (r) => Date.parse(r.date),
				renderCell: (r) => <DateCell value={r.date} />,
			},
			{
				key: "partner",
				headerName: t("dashboard.recent.partner"),
				sortValue: (r) => r.partnerName,
				renderCell: (r) => (
					<Box component="span" sx={{ fontWeight: 600 }}>
						{r.partnerName}
					</Box>
				),
			},
			{
				key: "type",
				headerName: t("dashboard.recent.type"),
				sortValue: (r) => t(`transaction.badge.base.${r.type}`),
				renderCell: (r) => <TransactionTypeBadge type={r.type} />,
			},
			{
				key: "status",
				headerName: t("dashboard.recent.statusCol"),
				sortValue: (r) => r.status,
				renderCell: (r) => <PaymentStatusChip status={r.status} />,
			},
			{
				key: "paid",
				headerName: t("dashboard.recent.paid"),
				align: "right",
				sortValue: (r) => r.paid,
				renderCell: (r) => <MoneyCell value={r.paid} />,
			},
			{
				key: "total",
				headerName: t("dashboard.recent.total"),
				align: "right",
				sortValue: (r) => r.total,
				renderCell: (r) => <MoneyCell value={r.total} main />,
			},
		],
		[t],
	);

	return (
		<Paper
			elevation={1}
			sx={{
				border: 1,
				borderColor: "divider",
				borderRadius: `${radius.lg}px`,
				overflow: "hidden",
				mt: "16px",
			}}
		>
			<Box sx={{ p: "16px 20px" }}>
				<Typography sx={{ fontSize: 15, fontWeight: 600 }}>
					{t("dashboard.recent.title")}
				</Typography>
			</Box>
			<DetailTable<DashboardRecentTransaction>
				rows={rows}
				columns={columns}
				defaultSort={{ key: "date", order: "desc" }}
				onRowClick={onOpen}
			/>
		</Paper>
	);
};

export default RecentTransactionsTable;
