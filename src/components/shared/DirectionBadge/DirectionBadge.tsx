import React from "react";
import StatusPill from "components/shared/Chip/StatusPill";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

interface DirectionBadgeProps {
	/** Money into the register (green ↓) vs out of it (red ↑). */
	income: boolean;
	/** Localized label (e.g. «Приход» / «Расход»). */
	label: string;
}

/**
 * Money-direction pill — green ↓ inflow / red ↑ outflow (the app-wide arrow
 * convention: in = ↓, out = ↑). The arrow carries the direction; amounts stay
 * unsigned (locked pattern 4).
 */
export const DirectionBadge: React.FC<DirectionBadgeProps> = ({ income, label }) => (
	<StatusPill
		token={income ? "income" : "expense"}
		icon={income ? ArrowDownwardIcon : ArrowUpwardIcon}
		label={label}
	/>
);

export default DirectionBadge;
