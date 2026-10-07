import React from "react";

import type { SxProps, Theme } from "@mui/material";
import { Box } from "@mui/material";

interface StatCardGridProps {
	/** Cards per row from `md` (`lg` for four or more); below that they stack / pair. */
	columns: number;
	children: React.ReactNode;
	/** Names a row of toggle cards (a filter) for assistive tech — renders it as a group. */
	label?: string;
	sx?: SxProps<Theme>;
}

/**
 * The row of `StatCard`s above a list or a detail tab — one gap and one bottom
 * margin everywhere, so a summary strip sits the same distance from its table on
 * every page.
 */
const StatCardGrid: React.FC<StatCardGridProps> = ({ columns, children, label, sx }) => (
	<Box
		role={label ? "group" : undefined}
		aria-label={label}
		sx={{
			display: "grid",
			gridTemplateColumns:
				columns >= 4
					? { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: `repeat(${columns}, minmax(0, 1fr))` }
					: { xs: "1fr", md: `repeat(${columns}, minmax(0, 1fr))` },
			gap: 2,
			mb: 2.5,
			...sx,
		}}
	>
		{children}
	</Box>
);

export default StatCardGrid;
