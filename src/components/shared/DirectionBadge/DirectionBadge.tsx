import React from "react";
import { chipTokens } from "theme";

import { Box } from "@mui/material";

interface DirectionBadgeProps {
	/** Money into the register (green ↓) vs out of it (red ↑). */
	income: boolean;
	/** Localized label (e.g. «Приход» / «Расход», «Доход» / «Расход»). */
	label: string;
}

/**
 * Money-direction pill — green ↓ inflow / red ↑ outflow, colours from
 * `chipTokens.income`/`expense`. The arrow carries the direction (no +/− on the
 * amount — locked pattern 4). Shared by the Payments list/detail and the Wallet
 * operations ledger; each caller supplies the localized label.
 */
export const DirectionBadge: React.FC<DirectionBadgeProps> = ({ income, label }) => {
	const tk = income ? chipTokens.income : chipTokens.expense;
	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "5px",
				fontSize: 11.5,
				fontWeight: 600,
				pl: "7px",
				pr: "9px",
				py: "2px",
				borderRadius: "999px",
				whiteSpace: "nowrap",
				border: "1px solid",
				bgcolor: tk.bg,
				color: tk.color,
				borderColor: tk.border,
			}}
		>
			<Box
				component="span"
				sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 800, fontSize: 13, lineHeight: 1 }}
			>
				{income ? "↓" : "↑"}
			</Box>
			{label}
		</Box>
	);
};

export default DirectionBadge;
