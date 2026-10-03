import React from "react";
import { useTranslation } from "react-i18next";
import PaymentStatusChip from "components/shared/Chip/PaymentStatusChip";
import { TransactionTypeBadge } from "components/transaction/TransactionBadges";
import { DashboardRecentTransaction } from "models/dashboard";
import { designTokens, numericSx } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import { Box, Paper, Typography } from "@mui/material";

const headCellSx = {
	textAlign: "left",
	fontSize: 12,
	fontWeight: 600,
	color: "text.secondary",
	p: "11px 16px",
	borderBottom: "1px solid",
	borderColor: "divider",
	whiteSpace: "nowrap",
} as const;

const bodyCellSx = {
	p: "12px 16px",
	borderBottom: "1px solid",
	borderColor: "divider",
	fontSize: 13,
	verticalAlign: "middle",
} as const;

interface Props {
	rows: DashboardRecentTransaction[];
	onOpen: (tx: DashboardRecentTransaction) => void;
}

/**
 * «Последние транзакции» — a read-only preview of the latest sales/supplies (no
 * pagination, by design — it's a briefing, not a browser). A row (click, or
 * Enter/Space when focused) opens the sale/supply detail. The full lists live on the dedicated
 * pages; the prototype's «Все продажи / поставки / заказы» header links were
 * removed (owner decision) — this is a preview, not a navigation hub.
 */
const RecentTransactionsTable: React.FC<Props> = ({ rows, onOpen }) => {
	const { t } = useTranslation();

	return (
		<Paper
			elevation={1}
			sx={{
				border: "1px solid",
				borderColor: "divider",
				borderRadius: "12px",
				overflow: "hidden",
				mt: "16px",
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", p: "16px 20px" }}>
				<Typography sx={{ fontSize: 15, fontWeight: 600 }}>
					{t("dashboard.recent.title")}
				</Typography>
			</Box>

			<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr>
						<Box component="th" sx={{ ...headCellSx, pl: "20px" }}>
							{t("dashboard.recent.date")}
						</Box>
						<Box component="th" sx={headCellSx}>
							{t("dashboard.recent.partner")}
						</Box>
						<Box component="th" sx={headCellSx}>
							{t("dashboard.recent.type")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
							{t("dashboard.recent.total")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
							{t("dashboard.recent.paid")}
						</Box>
						<Box component="th" sx={headCellSx}>
							{t("dashboard.recent.statusCol")}
						</Box>
					</tr>
				</thead>
				<tbody>
					{rows.map((r) => {
						return (
							<Box
								component="tr"
								key={r.id}
								onClick={() => onOpen(r)}
								onKeyDown={(e: React.KeyboardEvent) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										onOpen(r);
									}
								}}
								tabIndex={0}
								role="link"
								sx={{
									cursor: "pointer",
									"&:hover": { bgcolor: designTokens.gray25 },
									"&:focus-visible": {
										outline: "2px solid",
										outlineColor: "primary.main",
										outlineOffset: "-2px",
									},
								}}
							>
								<Box
									component="td"
									sx={{
										...bodyCellSx,
										...numericSx,
										pl: "20px",
										color: "text.secondary",
										whiteSpace: "nowrap",
									}}
								>
									{formatDateTime(r.date)}
								</Box>
								<Box component="td" sx={{ ...bodyCellSx, fontWeight: 600 }}>
									{r.partnerName}
								</Box>
								<Box component="td" sx={bodyCellSx}>
									<TransactionTypeBadge type={r.type} />
								</Box>
								<Box
									component="td"
									sx={{ ...bodyCellSx, ...numericSx, textAlign: "right", fontWeight: 600 }}
								>
									{formatCurrency(r.total)}
								</Box>
								<Box
									component="td"
									sx={{ ...bodyCellSx, ...numericSx, textAlign: "right", color: "text.secondary" }}
								>
									{formatCurrency(r.paid)}
								</Box>
								<Box component="td" sx={bodyCellSx}>
									<PaymentStatusChip status={r.status} />
								</Box>
							</Box>
						);
					})}
				</tbody>
			</Box>
		</Paper>
	);
};

export default RecentTransactionsTable;
