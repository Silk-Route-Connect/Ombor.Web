import React from "react";
import { numericSx, typeScale } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box } from "@mui/material";

import NoValue from "./NoValue";

/**
 * `ink` by default. `income` / `expense` only for amounts that carry a money
 * direction (payments, wallet operations, debts owed to us / by us).
 */
export type MoneyTone = "ink" | "income" | "expense";

const TONE_COLOR: Record<MoneyTone, string> = {
	ink: "text.primary",
	income: "success.main",
	expense: "error.main",
};

/** Body-size, regular-weight money for a table's secondary amount columns. */
const secondarySx = { ...numericSx, fontWeight: 400 } as const;

interface MoneyCellProps {
	/** `null` / `undefined` = not applicable («—»); 0 renders «0». */
	value: number | null | undefined;
	/** The table's main amount column (one per table): the 600 headline weight. */
	main?: boolean;
	tone?: MoneyTone;
}

/**
 * Money column cell: unsigned, tabular, no «UZS» (the unit shows only on totals
 * and hero figures). Right-align the column (`align: "right"`).
 */
export const MoneyCell: React.FC<MoneyCellProps> = ({ value, main = false, tone = "ink" }) => {
	if (value == null || !Number.isFinite(value)) {
		return <NoValue />;
	}
	return (
		<Box
			component="span"
			sx={{
				...(main ? typeScale.numTable : secondarySx),
				color: TONE_COLOR[tone],
				whiteSpace: "nowrap",
			}}
		>
			{formatCurrency(value)}
		</Box>
	);
};

export default MoneyCell;
