import React from "react";
import { useTranslation } from "react-i18next";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { designTokens } from "theme";

import AddIcon from "@mui/icons-material/Add";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Paper, Typography } from "@mui/material";

interface WarehouseEmptyStockProps {
	onOpeningStock: () => void;
}

/**
 * Empty-stock prompt per the bundle's `.wh-empty`: shown when a warehouse holds
 * no products yet, inviting an opening-stock entry (the migration-from-Excel
 * flow, business-rules rule 22).
 */
export const WarehouseEmptyStock: React.FC<WarehouseEmptyStockProps> = ({ onOpeningStock }) => {
	const { t } = useTranslation();

	return (
		<Paper
			elevation={1}
			sx={{
				border: 1,
				borderColor: "divider",
				borderRadius: "12px",
				p: "52px 24px 58px",
				textAlign: "center",
			}}
		>
			<Box
				sx={{
					width: 60,
					height: 60,
					borderRadius: "16px",
					mx: "auto",
					mb: "18px",
					display: "grid",
					placeItems: "center",
					bgcolor: "primary.light",
					border: "1px solid",
					borderColor: designTokens.primaryLine,
					color: "primary.main",
				}}
			>
				<WarehouseOutlinedIcon sx={{ fontSize: 28 }} />
			</Box>
			<Typography variant="h2" sx={{ mb: "8px" }}>
				{t("warehouse.detail.emptyStock.title")}
			</Typography>
			<Typography
				sx={{
					fontSize: 13.5,
					color: "text.secondary",
					maxWidth: 400,
					mx: "auto",
					lineHeight: 1.6,
					mb: "20px",
				}}
			>
				{t("warehouse.detail.emptyStock.body")}
			</Typography>
			<PrimaryButton icon={<AddIcon />} onClick={onOpeningStock}>
				{t("warehouse.detail.emptyStock.action")}
			</PrimaryButton>
		</Paper>
	);
};

export default WarehouseEmptyStock;
