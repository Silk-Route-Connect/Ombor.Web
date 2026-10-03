import React from "react";
import UzsUnit from "components/shared/Money/UzsUnit";
import { numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box } from "@mui/material";

import { MoneyTone } from "./cells/MoneyCell";

export interface TableTotalItem {
	label: string;
	/** A money sum (UZS) over the filtered rows. */
	value: number;
	/** `income` / `expense` only for a direction total (Приход / Расход). */
	tone?: MoneyTone;
}

interface TableTotalsProps {
	/** The row count in words, e.g. «125 документов». */
	count: string;
	items?: TableTotalItem[];
}

const TONE_COLOR: Record<MoneyTone, string> = {
	ink: "text.primary",
	income: "success.main",
	expense: "error.main",
};

/**
 * The totals of a list's filtered rows — count and money sums — in the table's
 * footer band, left of the pager (`DataTable` / `DetailTable` `summary`). It
 * follows every filter, search and date period, so a filtered list answers
 * «how much this month» until Reports exist.
 */
const TableTotals: React.FC<TableTotalsProps> = ({ count, items = [] }) => (
	<Box
		sx={{
			display: "flex",
			flexWrap: "wrap",
			alignItems: "baseline",
			columnGap: "20px",
			rowGap: "4px",
			px: 2,
			py: "10px",
			fontSize: 13,
		}}
	>
		<Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
			{count}
		</Box>
		{items.map((item) => (
			<Box component="span" key={item.label} sx={{ whiteSpace: "nowrap" }}>
				<Box component="span" sx={{ color: "text.secondary", mr: "6px" }}>
					{item.label}
				</Box>
				<Box
					component="span"
					sx={{ ...numericSx, fontWeight: 600, color: TONE_COLOR[item.tone ?? "ink"] }}
				>
					{formatCurrency(item.value)}
				</Box>
				<UzsUnit />
			</Box>
		))}
	</Box>
);

export default TableTotals;
