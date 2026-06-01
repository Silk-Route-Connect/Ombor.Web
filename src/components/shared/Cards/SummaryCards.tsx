import React from "react";

import { Box, Paper, Typography } from "@mui/material";

export interface SummaryCardProps {
	icon: React.ReactNode;
	tone: "teal" | "saffron";
	caption: string;
	value: string;
	unit?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ icon, tone, caption, value, unit }) => (
	<Paper
		elevation={1}
		sx={{
			display: "flex",
			alignItems: "center",
			gap: 1.75,
			border: 1,
			borderColor: "divider",
			borderRadius: 1.5,
			p: 2,
		}}
	>
		<Box
			sx={{
				width: 42,
				height: 42,
				flexShrink: 0,
				borderRadius: "11px",
				display: "grid",
				placeItems: "center",
				bgcolor: tone === "teal" ? "primary.light" : "secondary.light",
				color: tone === "teal" ? "primary.main" : "secondary.dark",
			}}
		>
			{icon}
		</Box>
		<Box sx={{ minWidth: 0 }}>
			<Typography variant="body2" sx={{ color: "text.secondary" }}>
				{caption}
			</Typography>
			<Typography
				sx={{
					fontSize: "1.5rem",
					fontWeight: 700,
					letterSpacing: "-0.02em",
					lineHeight: 1.1,
					mt: 0.25,
					fontVariantNumeric: "tabular-nums",
				}}
			>
				{value}
				{unit && (
					<Typography
						component="span"
						sx={{ ml: 0.5, fontSize: "0.8125rem", fontWeight: 600, color: "text.disabled" }}
					>
						{unit}
					</Typography>
				)}
			</Typography>
		</Box>
	</Paper>
);

/** Responsive row of summary cards. `columns` controls the sm+ column count. */
const SummaryCards: React.FC<{ cards: SummaryCardProps[]; columns?: number }> = ({
	cards,
	columns = 3,
}) => (
	<Box
		sx={{
			display: "grid",
			gap: 2,
			gridTemplateColumns: { xs: "1fr", sm: `repeat(${columns}, 1fr)` },
			mb: 3,
		}}
	>
		{cards.map((card) => (
			<SummaryCard key={card.caption} {...card} />
		))}
	</Box>
);

export default SummaryCards;
