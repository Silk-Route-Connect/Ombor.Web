import React from "react";
import { translate } from "i18n/i18n";
import { formatMoney, formatSignedMoney } from "utils/formatCurrency";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, Chip, Typography, useTheme } from "@mui/material";

import { AgingTone, DashboardSummary } from "../../models/dashboard";
import DashboardPanel from "./DashboardPanel";

const AgingPanel: React.FC<{ aging: DashboardSummary["aging"] }> = ({ aging }) => {
	const theme = useTheme();
	const { buckets, totalReceivable, overdueAmount, overdueCount } = aging;

	const toneColor: Record<AgingTone, string> = {
		success: theme.palette.success.main,
		primary: theme.palette.primary.main,
		warning: theme.palette.warning.main,
		error: theme.palette.error.main,
	};

	const pct = (amt: number) => (totalReceivable ? Math.round((amt / totalReceivable) * 100) : 0);

	return (
		<DashboardPanel title={translate("dashboard.aging.title")}>
			{/* overdue banner */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 1.5,
					p: 1.5,
					mb: 2,
					borderRadius: 1.5,
					bgcolor: "grey.50",
				}}
			>
				<Box>
					<Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
						{translate("dashboard.aging.overdueCap")}
					</Typography>
					<Typography
						sx={{
							fontSize: "1.25rem",
							fontWeight: 700,
							letterSpacing: "-0.01em",
							color: overdueAmount > 0 ? "warning.main" : "text.disabled",
							fontVariantNumeric: "tabular-nums",
						}}
					>
						{formatMoney(overdueAmount)}
					</Typography>
				</Box>
				{overdueAmount > 0 && (
					<Chip
						icon={<WarningAmberIcon />}
						label={translate("dashboard.aging.transactions", { count: overdueCount })}
						size="small"
						sx={{
							bgcolor: "warning.light",
							color: "warning.main",
							"& .MuiChip-icon": { color: "warning.main" },
						}}
					/>
				)}
			</Box>

			{/* stacked proportion bar */}
			<Box sx={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", mb: 2 }}>
				{buckets.map((b) => (
					<Box
						key={b.label}
						sx={{ width: `${(b.amount / totalReceivable) * 100}%`, bgcolor: toneColor[b.tone] }}
					/>
				))}
			</Box>

			{/* bucket list */}
			<Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
				{buckets.map((b) => (
					<Box key={b.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: toneColor[b.tone] }} />
						<Typography variant="body2" sx={{ flex: 1, color: "text.primary" }}>
							{b.label}
							<Typography component="span" variant="caption" sx={{ color: "text.disabled", ml: 1 }}>
								{pct(b.amount)}%
							</Typography>
						</Typography>
						<Typography
							variant="body2"
							sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
						>
							{formatMoney(b.amount)}
						</Typography>
					</Box>
				))}
			</Box>

			{/* total */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					mt: 2,
					pt: 1.5,
					borderTop: 1,
					borderColor: "divider",
				}}
			>
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					{translate("dashboard.aging.total")}
				</Typography>
				<Typography
					sx={{
						fontWeight: 700,
						fontSize: "1rem",
						color: "success.main",
						fontVariantNumeric: "tabular-nums",
					}}
				>
					{formatSignedMoney(totalReceivable)}
				</Typography>
			</Box>
		</DashboardPanel>
	);
};

export default AgingPanel;
