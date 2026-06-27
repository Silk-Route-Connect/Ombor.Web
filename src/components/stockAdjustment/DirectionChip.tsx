import React from "react";
import { useTranslation } from "react-i18next";
import { AdjustmentDirection } from "models/stockAdjustment";
import { chipTokens } from "theme";

import { Box } from "@mui/material";

/**
 * Direction chip per the bundle's `DirBadge`: Списание loss (red), Оприходование
 * gain (green). Colours are sourced from `chipTokens` — an Increase reuses the
 * income (green) token, a Decrease the expense (red) token: the green/red intent
 * is identical even though stock movement is not money (no inline hex, no
 * per-component colour logic).
 */
const DIRECTION_TOKEN: Record<AdjustmentDirection, keyof typeof chipTokens> = {
	Increase: "income",
	Decrease: "expense",
};

export const DirectionChip: React.FC<{ direction: AdjustmentDirection }> = ({ direction }) => {
	const { t } = useTranslation();
	const tk = chipTokens[DIRECTION_TOKEN[direction]];

	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				height: 22,
				px: "9px",
				borderRadius: "999px",
				fontSize: 12,
				fontWeight: 600,
				whiteSpace: "nowrap",
				border: "1px solid",
				bgcolor: tk.bg,
				color: tk.color,
				borderColor: tk.border,
			}}
		>
			{t(`adjustment.direction.${direction}`)}
		</Box>
	);
};

export default DirectionChip;
