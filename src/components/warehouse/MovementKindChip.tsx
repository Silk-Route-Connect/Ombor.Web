import React from "react";
import { useTranslation } from "react-i18next";
import { WarehouseMovementKind } from "models/warehouse";
import { designTokens } from "theme";

import { alpha, Chip, useTheme } from "@mui/material";

/**
 * Movement-type chip per the bundle's MOVE_TYPE tones: opening / transfer
 * neutral, supply info, sale primary, refund success, adjustment warning.
 */
const NEUTRAL_KINDS: WarehouseMovementKind[] = ["Opening", "Transfer"];

export const MovementKindChip: React.FC<{ kind: WarehouseMovementKind }> = ({ kind }) => {
	const { t } = useTranslation();
	const theme = useTheme();

	const palette = ((): { bg: string; color: string } => {
		switch (kind) {
			case "Supply":
				return { bg: alpha(theme.palette.info.main, 0.12), color: theme.palette.info.main };
			case "Sale":
				return { bg: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main };
			case "Refund":
				return { bg: alpha(theme.palette.success.main, 0.12), color: theme.palette.success.main };
			case "Adjustment":
				return { bg: designTokens.warningBg, color: designTokens.saffron700 };
			default:
				return { bg: designTokens.gray100, color: designTokens.gray700 };
		}
	})();

	const neutral = NEUTRAL_KINDS.includes(kind);

	return (
		<Chip
			label={t(`warehouse.movement.${kind}`)}
			size="small"
			sx={{
				height: 22,
				fontSize: 12,
				fontWeight: 600,
				bgcolor: palette.bg,
				color: palette.color,
				border: neutral ? "1px solid" : "none",
				borderColor: neutral ? designTokens.gray200 : undefined,
			}}
		/>
	);
};

export default MovementKindChip;
