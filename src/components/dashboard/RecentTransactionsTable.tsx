import React from "react";
import { useTranslation } from "react-i18next";
import { DashboardRecentTransaction, DashboardTxStatus } from "models/dashboard";
import { designTokens, numericSx } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
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
	fontSize: 13.5,
	verticalAlign: "middle",
} as const;

const STATUS_TONE: Record<DashboardTxStatus, { bg: string; color: string; key: string }> = {
	paid: { bg: designTokens.successBg, color: "#17835A", key: "dashboard.recent.status.paid" },
	partial: { bg: designTokens.warningBg, color: "#C57E14", key: "dashboard.recent.status.partial" },
	unpaid: { bg: designTokens.errorBg, color: "#C53D31", key: "dashboard.recent.status.unpaid" },
};

const StatusChip: React.FC<{ status: DashboardTxStatus }> = ({ status }) => {
	const { t } = useTranslation();
	const tone = STATUS_TONE[status];
	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				fontSize: 11.5,
				fontWeight: 600,
				px: "9px",
				py: "2px",
				borderRadius: "999px",
				whiteSpace: "nowrap",
				bgcolor: tone.bg,
				color: tone.color,
			}}
		>
			{t(tone.key)}
		</Box>
	);
};

interface Props {
	rows: DashboardRecentTransaction[];
	onSales: () => void;
	onSupplies: () => void;
	onOrders: () => void;
	onOpen: (tx: DashboardRecentTransaction) => void;
}

/** A small "open the full list" link in the panel header. */
const SeeAllLink: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
	<Box
		onClick={onClick}
		sx={{
			display: "inline-flex",
			alignItems: "center",
			gap: "2px",
			color: "primary.main",
			fontSize: 13,
			fontWeight: 600,
			cursor: "pointer",
			whiteSpace: "nowrap",
			"&:hover": { textDecoration: "underline" },
		}}
	>
		{label}
		<ChevronRightIcon sx={{ fontSize: 16 }} />
	</Box>
);

/**
 * «Последние транзакции» — a read-only preview of the latest sales/supplies (no
 * pagination, by design — it's a briefing, not a browser). A row click toasts
 * (self-contained mock, like the Долги rows). The header carries explicit links
 * to the full, paginated/filterable lists: Продажи (sales + sale-refunds),
 * Поставки (supplies + supply-refunds) and Заказы.
 */
const RecentTransactionsTable: React.FC<Props> = ({
	rows,
	onSales,
	onSupplies,
	onOrders,
	onOpen,
}) => {
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
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					p: "16px 20px",
				}}
			>
				<Typography sx={{ fontSize: 15, fontWeight: 600 }}>
					{t("dashboard.recent.title")}
				</Typography>
				<Box sx={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
					<SeeAllLink label={t("dashboard.recent.allSales")} onClick={onSales} />
					<SeeAllLink label={t("dashboard.recent.allSupplies")} onClick={onSupplies} />
					<SeeAllLink label={t("dashboard.recent.allOrders")} onClick={onOrders} />
				</Box>
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
						const isSale = r.type === "Sale";
						return (
							<Box
								component="tr"
								key={r.id}
								onClick={() => onOpen(r)}
								sx={{ cursor: "pointer", "&:hover": { bgcolor: designTokens.gray25 } }}
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
									<Box sx={{ display: "inline-flex", alignItems: "center", gap: "9px" }}>
										<Box
											sx={{
												width: 26,
												height: 26,
												borderRadius: "8px",
												display: "grid",
												placeItems: "center",
												bgcolor: isSale ? designTokens.successBg : designTokens.errorBg,
												color: isSale ? "#17835A" : "#C53D31",
											}}
										>
											{isSale ? (
												<NorthEastIcon sx={{ fontSize: 15 }} />
											) : (
												<LocalShippingOutlinedIcon sx={{ fontSize: 15 }} />
											)}
										</Box>
										<Box component="span" sx={{ fontSize: 13.5 }}>
											{t(isSale ? "dashboard.recent.sale" : "dashboard.recent.supply")}
										</Box>
									</Box>
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
									<StatusChip status={r.status} />
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
