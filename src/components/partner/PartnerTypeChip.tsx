import React from "react";
import { useTranslation } from "react-i18next";
import { PartnerType } from "models/partner";

import { alpha, Box, useTheme } from "@mui/material";

/** Tone per partner type: client = info, supplier = warning, both = primary. */
const TONE: Record<PartnerType, "info" | "warning" | "primary"> = {
	Customer: "info",
	Supplier: "warning",
	Both: "primary",
};

interface PartnerTypeChipProps {
	type: PartnerType;
}

/** Soft pill per the bundle's `.chip-soft` — tinted background, colored text. */
export const PartnerTypeChip: React.FC<PartnerTypeChipProps> = ({ type }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const color = theme.palette[TONE[type]].main;

	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				px: "8px",
				py: "2px",
				borderRadius: "999px",
				fontSize: 11,
				fontWeight: 600,
				lineHeight: 1.4,
				whiteSpace: "nowrap",
				color,
				bgcolor: alpha(color, 0.12),
				border: "1px solid",
				borderColor: alpha(color, 0.24),
			}}
		>
			{t(`partner.typeShort.${type}`)}
		</Box>
	);
};

export default PartnerTypeChip;
