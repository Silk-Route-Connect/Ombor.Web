import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";
import { AdjustmentDirection } from "models/stockAdjustment";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

/**
 * Stock-adjustment direction. Stock is not money, so green/red stay reserved:
 * Increase (stock in) = blue ↓, Decrease (stock out) = amber ↑ — the app-wide
 * arrow convention (in = ↓, out = ↑). Unknown served values render as Increase.
 */
export const DirectionChip: React.FC<{ direction: AdjustmentDirection }> = ({ direction }) => {
	const { t } = useTranslation();
	const out = direction === "Decrease";
	return (
		<StatusPill
			token={out ? "stockOut" : "stockIn"}
			icon={out ? ArrowUpwardIcon : ArrowDownwardIcon}
			label={t(`adjustment.direction.${direction}`)}
		/>
	);
};

export default DirectionChip;
