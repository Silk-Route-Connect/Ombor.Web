import React from "react";
import { useTranslation } from "react-i18next";
import { AdjustmentDirection } from "models/stockAdjustment";
import { chipTokens } from "theme";

import NorthEastIcon from "@mui/icons-material/NorthEast";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import { Box } from "@mui/material";

/**
 * Direction chip (parked decision → resolved as a chip). Stock direction is NOT
 * money, so green/red is reserved: Increase (оприходование, stock in) reads blue
 * with an ↑ arrow, Decrease (списание, stock out) amber with a ↓ arrow — the
 * `transfer` / `adjustment` chipToken appearances. The arrow + label carry the
 * meaning; the colours are a distinct, non-money pair.
 */
// Keyed by string with an Increase fallback so an unexpected served `direction`
// can't crash the row (the served value is a free string).
const DIRECTION: Record<string, { token: keyof typeof chipTokens; Icon: typeof NorthEastIcon }> = {
	Increase: { token: "transfer", Icon: NorthEastIcon },
	Decrease: { token: "adjustment", Icon: SouthEastIcon },
};

export const DirectionChip: React.FC<{ direction: AdjustmentDirection }> = ({ direction }) => {
	const { t } = useTranslation();
	const { token, Icon } = DIRECTION[direction] ?? DIRECTION.Increase;
	const tk = chipTokens[token];

	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "4px",
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
			<Icon sx={{ fontSize: 13 }} />
			{t(`adjustment.direction.${direction}`)}
		</Box>
	);
};

export default DirectionChip;
