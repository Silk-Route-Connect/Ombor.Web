import React from "react";
import { numericSx, typeScale } from "theme";
import { formatCurrency, formatCurrencyMinus } from "utils/formatCurrency";

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
	/** A refund row in the Sales / Supplies feed: the served (positive) amount reads «−18 000» (D12). */
	negative?: boolean;
}

/**
 * Money column cell: unsigned (except a `negative` refund row), tabular, no
 * «UZS» (the unit shows only on totals and hero figures). Right-align the
 * column (`align: "right"`).
 */
export const MoneyCell: React.FC<MoneyCellProps> = ({
	value,
	main = false,
	tone = "ink",
	negative = false,
}) => {
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
			{negative ? formatCurrencyMinus(-value) : formatCurrency(value)}
		</Box>
	);
};

export default MoneyCell;
