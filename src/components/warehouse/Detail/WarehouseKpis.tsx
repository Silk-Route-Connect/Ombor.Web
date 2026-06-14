import React from "react";
import { useTranslation } from "react-i18next";
import { Warehouse } from "models/warehouse";
import { numericSx } from "theme";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { Box, Paper, Typography } from "@mui/material";

interface WarehouseKpisProps {
	warehouse: Warehouse;
}

const Kpi: React.FC<{
	icon: React.ReactNode;
	caption: string;
	value: React.ReactNode;
	sub: string;
	accent?: boolean;
}> = ({ icon, caption, value, sub, accent }) => (
	<Paper
		elevation={1}
		sx={{ border: 1, borderColor: "divider", borderRadius: "12px", p: "18px 20px" }}
	>
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "8px",
				fontSize: 13,
				color: "text.secondary",
			}}
		>
			{icon}
			{caption}
		</Box>
		<Typography
			sx={{
				...numericSx,
				fontSize: 30,
				fontWeight: 800,
				letterSpacing: "-0.025em",
				lineHeight: 1,
				mt: "10px",
				color: accent ? "primary.main" : "text.primary",
			}}
		>
			{value}
		</Typography>
		<Typography sx={{ fontSize: 12, color: "text.secondary", mt: "8px" }}>{sub}</Typography>
	</Paper>
);

const Unit: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Box
		component="span"
		sx={{ fontSize: 14, fontWeight: 600, color: "text.disabled", ml: "7px", letterSpacing: 0 }}
	>
		{children}
	</Box>
);

/** Three summary KPI cards per the bundle: products, units, stock value (WAC). */
export const WarehouseKpis: React.FC<WarehouseKpisProps> = ({ warehouse }) => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
				gap: "16px",
				mb: "20px",
			}}
		>
			<Kpi
				icon={<Inventory2OutlinedIcon sx={{ fontSize: 16, color: "text.disabled" }} />}
				caption={t("warehouse.kpi.products")}
				value={formatQuantity(warehouse.productCount)}
				sub={t("warehouse.kpi.productsSub")}
			/>
			<Kpi
				icon={<LayersOutlinedIcon sx={{ fontSize: 16, color: "text.disabled" }} />}
				caption={t("warehouse.kpi.units")}
				value={
					<>
						{formatQuantity(warehouse.totalUnits)}
						<Unit>{t("warehouse.kpi.unitsSuffix")}</Unit>
					</>
				}
				sub={t("warehouse.kpi.unitsSub")}
			/>
			<Kpi
				accent
				icon={<PaymentsOutlinedIcon sx={{ fontSize: 16, color: "text.disabled" }} />}
				caption={t("warehouse.kpi.value")}
				value={
					<>
						{formatCurrency(warehouse.stockValue)}
						<Unit>UZS</Unit>
					</>
				}
				sub={t("warehouse.kpi.valueSub")}
			/>
		</Box>
	);
};

export default WarehouseKpis;
