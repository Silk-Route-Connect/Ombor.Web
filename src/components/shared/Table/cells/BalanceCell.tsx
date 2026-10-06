import React from "react";
import { numericSx, typeScale } from "theme";
import { formatPartnerBalance, partnerBalanceColor } from "utils/partnerUtils";

import { Box } from "@mui/material";

interface BalanceCellProps {
	/** Served company-side value (+ = the partner owes us). */
	balance: number;
	/** The table's main amount column: the 600 headline weight. */
	main?: boolean;
}

/**
 * A partner's balance (or a ledger movement on it) from the partner's side —
 * the only signed money in tables (DR-27): «−500 000» red when they owe us,
 * «+30 000» green when we owe them, «0» neutral when settled.
 */
export const BalanceCell: React.FC<BalanceCellProps> = ({ balance, main = false }) => (
	<Box
		component="span"
		sx={{
			...(main ? typeScale.numTable : { ...numericSx, fontWeight: 400 }),
			color: partnerBalanceColor(balance),
			whiteSpace: "nowrap",
		}}
	>
		{formatPartnerBalance(balance)}
	</Box>
);

export default BalanceCell;
