import React from "react";
import { useTranslation } from "react-i18next";
import UzsUnit from "components/shared/Money/UzsUnit";
import { WarehouseTotals } from "stores/WarehouseStore";
import { numericSx } from "theme";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { Box, Typography } from "@mui/material";

interface WarehouseSummaryStripProps {
	totals: WarehouseTotals;
}

const CARD_SX = {
	position: "relative",
	overflow: "hidden",
	bgcolor: "background.paper",
	border: "1px solid",
	borderColor: "divider",
	borderRadius: "12px",
	boxShadow: 1,
	p: "16px 18px",
	"&::before": {
		content: '""',
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		width: "3px",
		bgcolor: "primary.main",
	},
} as const;

const Cap: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: "8px",
			fontSize: 12.5,
			fontWeight: 600,
			color: "text.secondary",
		}}
	>
		<Box component="span" sx={{ display: "inline-flex", color: "text.disabled" }}>
			{icon}
		</Box>
		{label}
	</Box>
);

const Value: React.FC<{ accent?: boolean; children: React.ReactNode }> = ({ accent, children }) => (
	<Typography
		sx={{
			...numericSx,
			fontWeight: 700,
			fontSize: 26,
			letterSpacing: "-0.02em",
			lineHeight: 1,
			mt: "9px",
			color: accent ? "primary.main" : "text.primary",
		}}
	>
		{children}
	</Typography>
);

const Sub: React.FC<{ text: string }> = ({ text }) => (
	<Typography sx={{ fontSize: 12, color: "text.disabled", mt: "8px" }}>{text}</Typography>
);

/**
 * List summary strip: total inventory across ALL warehouses — including archived
 * ones that still hold stock (business-rules rule 31). The Partners-style
 * 3-card strip replaces the old in-table «Итого» row dropped when the list moved
 * onto the shared DataTable (which has no footer slot).
 */
export const WarehouseSummaryStrip: React.FC<WarehouseSummaryStripProps> = ({ totals }) => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
				gap: "14px",
				mb: "18px",
			}}
		>
			<Box sx={CARD_SX}>
				<Cap
					icon={<Inventory2OutlinedIcon sx={{ fontSize: 16 }} />}
					label={t("warehouse.summary.products")}
				/>
				<Value>{formatQuantity(totals.productCount)}</Value>
				<Sub text={t("warehouse.summary.productsSub")} />
			</Box>

			<Box sx={CARD_SX}>
				<Cap
					icon={<LayersOutlinedIcon sx={{ fontSize: 16 }} />}
					label={t("warehouse.summary.units")}
				/>
				<Value>
					{formatQuantity(totals.totalUnits)}
					<Box
						component="span"
						sx={{ fontSize: 12.5, fontWeight: 600, color: "text.disabled", ml: "7px" }}
					>
						{t("warehouse.kpi.unitsSuffix")}
					</Box>
				</Value>
				<Sub text={t("warehouse.summary.unitsSub")} />
			</Box>

			<Box sx={CARD_SX}>
				<Cap
					icon={<PaymentsOutlinedIcon sx={{ fontSize: 16 }} />}
					label={t("warehouse.summary.value")}
				/>
				<Value accent>
					{formatCurrency(totals.stockValue)}
					<UzsUnit sx={{ fontSize: 12.5, ml: "7px" }} />
				</Value>
				<Sub text={t("warehouse.summary.valueSub")} />
			</Box>
		</Box>
	);
};

export default WarehouseSummaryStrip;
