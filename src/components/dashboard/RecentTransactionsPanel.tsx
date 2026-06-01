import React from "react";
import { useNavigate } from "react-router-dom";
import { translate } from "i18n/i18n";
import { formatMoney } from "utils/formatCurrency";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import {
	Box,
	Button,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Typography,
} from "@mui/material";

import { RecentTransaction, RecentTransactionStatus } from "../../models/dashboard";
import DashboardPanel from "./DashboardPanel";

const STATUS_COLOR: Record<RecentTransactionStatus, "success" | "warning" | "error"> = {
	paid: "success",
	part: "warning",
	unpaid: "error",
};

const headCellSx = {
	border: 0,
	color: "text.secondary",
	fontWeight: 600,
	fontSize: "0.75rem",
	py: 1,
} as const;

const bodyCellSx = { borderColor: "divider", py: 1.25 } as const;

const RecentTransactionsPanel: React.FC<{ transactions: RecentTransaction[] }> = ({
	transactions,
}) => {
	const navigate = useNavigate();

	return (
		<DashboardPanel
			title={translate("dashboard.recent.title")}
			action={
				<Button
					variant="text"
					size="small"
					endIcon={<ChevronRightIcon />}
					onClick={() => navigate("/sales")}
				>
					{translate("dashboard.recent.all")}
				</Button>
			}
		>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell sx={headCellSx}>{translate("dashboard.recent.col.date")}</TableCell>
						<TableCell sx={headCellSx}>{translate("dashboard.recent.col.partner")}</TableCell>
						<TableCell sx={headCellSx}>{translate("dashboard.recent.col.type")}</TableCell>
						<TableCell sx={headCellSx} align="right">
							{translate("dashboard.recent.col.amount")}
						</TableCell>
						<TableCell sx={headCellSx} align="right">
							{translate("dashboard.recent.col.paid")}
						</TableCell>
						<TableCell sx={headCellSx}>{translate("dashboard.recent.col.status")}</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{transactions.map((t) => (
						<TableRow key={t.id} hover>
							<TableCell sx={{ ...bodyCellSx, color: "text.secondary", whiteSpace: "nowrap" }}>
								{t.dateTime}
							</TableCell>
							<TableCell sx={{ ...bodyCellSx, fontWeight: 600 }}>{t.partner}</TableCell>
							<TableCell sx={bodyCellSx}>
								<Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
									<Box
										sx={{
											width: 26,
											height: 26,
											borderRadius: 1.5,
											display: "grid",
											placeItems: "center",
											bgcolor: t.type === "sale" ? "success.light" : "error.light",
											color: t.type === "sale" ? "success.main" : "error.main",
										}}
									>
										{t.type === "sale" ? (
											<NorthEastIcon sx={{ fontSize: 15 }} />
										) : (
											<LocalShippingOutlinedIcon sx={{ fontSize: 15 }} />
										)}
									</Box>
									<Typography variant="body2">{t.typeLabel}</Typography>
								</Box>
							</TableCell>
							<TableCell sx={{ ...bodyCellSx, fontWeight: 600 }} align="right">
								{formatMoney(t.amount)}
							</TableCell>
							<TableCell sx={{ ...bodyCellSx, color: "text.secondary" }} align="right">
								{formatMoney(t.paid)}
							</TableCell>
							<TableCell sx={bodyCellSx}>
								<Chip
									label={translate(`dashboard.status.${t.status}`)}
									size="small"
									color={STATUS_COLOR[t.status]}
									variant="outlined"
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</DashboardPanel>
	);
};

export default RecentTransactionsPanel;
