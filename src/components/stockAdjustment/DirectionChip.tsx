import React from "react";
import { useTranslation } from "react-i18next";
import { AdjustmentDirection } from "models/stockAdjustment";

import { alpha, Chip, useTheme } from "@mui/material";

/**
 * Direction chip per the bundle's `DirBadge`: Списание error-tinted (red),
 * Оприходование success-tinted (green).
 */
export const DirectionChip: React.FC<{ direction: AdjustmentDirection }> = ({ direction }) => {
	const { t } = useTranslation();
	const theme = useTheme();

	const color = direction === "Decrease" ? theme.palette.error.main : theme.palette.success.main;

	return (
		<Chip
			label={t(`adjustment.direction.${direction}`)}
			size="small"
			sx={{
				height: 22,
				fontSize: 12,
				fontWeight: 600,
				bgcolor: alpha(color, 0.12),
				color,
			}}
		/>
	);
};

export default DirectionChip;
