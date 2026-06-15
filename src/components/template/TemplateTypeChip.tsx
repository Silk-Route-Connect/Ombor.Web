import React from "react";
import { useTranslation } from "react-i18next";
import { TemplateType } from "models/template";

import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { alpha, Box, useTheme } from "@mui/material";

/** Tone per template type: sale = info (blue), supply = warning (saffron). */
const TONE: Record<TemplateType, "info" | "warning"> = {
	Sale: "info",
	Supply: "warning",
};

const ICON: Record<TemplateType, React.ReactNode> = {
	Sale: <ReceiptLongOutlinedIcon sx={{ fontSize: 14 }} />,
	Supply: <LocalShippingOutlinedIcon sx={{ fontSize: 14 }} />,
};

interface TemplateTypeChipProps {
	type: TemplateType;
}

/** Soft pill per the bundle's `Chip variant="soft"` — tinted bg, colored text + icon. */
export const TemplateTypeChip: React.FC<TemplateTypeChipProps> = ({ type }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const color = theme.palette[TONE[type]].main;

	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "5px",
				px: "9px",
				py: "3px",
				borderRadius: "999px",
				fontSize: 11.5,
				fontWeight: 600,
				lineHeight: 1.4,
				whiteSpace: "nowrap",
				color,
				bgcolor: alpha(color, 0.12),
				border: "1px solid",
				borderColor: alpha(color, 0.24),
			}}
		>
			{ICON[type]}
			{t(`template.type.${type}`)}
		</Box>
	);
};

export default TemplateTypeChip;
