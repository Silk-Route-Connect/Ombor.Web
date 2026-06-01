import React from "react";
import { translate } from "i18n/i18n";
import { formatMoney } from "utils/formatCurrency";
import { WarehousesSummary } from "utils/warehouseStats";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Paper, Typography } from "@mui/material";

interface SummaryCardProps {
	icon: React.ReactNode;
	tone: "teal" | "saffron";
	caption: string;
	value: string;
	unit?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, tone, caption, value, unit }) => (
	<Paper
		elevation={1}
		sx={{
			display: "flex",
			alignItems: "center",
			gap: 1.75,
			border: 1,
			borderColor: "divider",
			borderRadius: 1.5,
			p: 2,
		}}
	>
		<Box
			sx={{
				width: 42,
				height: 42,
				flexShrink: 0,
				borderRadius: "11px",
				display: "grid",
				placeItems: "center",
				bgcolor: tone === "teal" ? "primary.light" : "secondary.light",
				color: tone === "teal" ? "primary.main" : "secondary.dark",
			}}
		>
			{icon}
		</Box>
		<Box sx={{ minWidth: 0 }}>
			<Typography variant="body2" sx={{ color: "text.secondary" }}>
				{caption}
			</Typography>
			<Typography
				sx={{
					fontSize: "1.5rem",
					fontWeight: 700,
					letterSpacing: "-0.02em",
					lineHeight: 1.1,
					mt: 0.25,
					fontVariantNumeric: "tabular-nums",
				}}
			>
				{value}
				{unit && (
					<Typography
						component="span"
						sx={{ ml: 0.5, fontSize: "0.8125rem", fontWeight: 600, color: "text.disabled" }}
					>
						{unit}
					</Typography>
				)}
			</Typography>
		</Box>
	</Paper>
);

const WarehouseSummary: React.FC<{ summary: WarehousesSummary }> = ({ summary }) => (
	<Box
		sx={{
			display: "grid",
			gap: 2,
			gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
			mb: 3,
		}}
	>
		<SummaryCard
			icon={<WarehouseOutlinedIcon />}
			tone="teal"
			caption={translate("warehouse.summary.activeWarehouses")}
			value={summary.activeCount.toString()}
		/>
		<SummaryCard
			icon={<Inventory2OutlinedIcon />}
			tone="teal"
			caption={translate("warehouse.summary.totalProducts")}
			value={summary.totalProducts.toString()}
		/>
		<SummaryCard
			icon={<PaymentsOutlinedIcon />}
			tone="saffron"
			caption={translate("warehouse.summary.totalValue")}
			value={summary.totalValue === null ? "—" : formatMoney(summary.totalValue)}
			unit={summary.totalValue === null ? undefined : "UZS"}
		/>
	</Box>
);

export default WarehouseSummary;
