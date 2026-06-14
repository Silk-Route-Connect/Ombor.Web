import React from "react";

import { alpha, Box, Paper, Typography, useTheme } from "@mui/material";

export const headCellSx = {
	textAlign: "left",
	fontSize: 12,
	fontWeight: 600,
	color: "text.secondary",
	p: "12px 18px",
	borderBottom: "1px solid",
	borderColor: "divider",
	whiteSpace: "nowrap",
	bgcolor: "background.paper",
} as const;

export const bodyCellSx = {
	p: "13px 18px",
	borderBottom: "1px solid",
	borderColor: "divider",
	fontSize: 14,
	verticalAlign: "middle",
} as const;

/** Card wrapper for the detail tables (bundle `.ledger-card`). */
export const LedgerCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Paper
		elevation={1}
		sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
	>
		{children}
	</Paper>
);

/** In-card empty state (bundle `.hist-empty`). */
export const EmptyRecords: React.FC<{ icon: React.ReactNode; title: string; body: string }> = ({
	icon,
	title,
	body,
}) => (
	<Box
		sx={{
			p: "40px 24px 44px",
			textAlign: "center",
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			gap: "6px",
			color: "text.secondary",
		}}
	>
		<Box sx={{ color: "text.disabled", mb: "4px" }}>{icon}</Box>
		<Typography sx={{ fontWeight: 600, fontSize: 15, color: "text.primary" }}>{title}</Typography>
		<Typography sx={{ fontSize: 13, color: "text.secondary", maxWidth: 360, lineHeight: 1.55 }}>
			{body}
		</Typography>
	</Box>
);

type StatusTone = "success" | "warning" | "error";

/** Soft status pill (bundle `.chip-soft`) for transaction payment status. */
export const SoftChip: React.FC<{ tone: StatusTone; label: string }> = ({ tone, label }) => {
	const theme = useTheme();
	const color = theme.palette[tone].main;
	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				px: "8px",
				py: "2px",
				borderRadius: "999px",
				fontSize: 11,
				fontWeight: 600,
				whiteSpace: "nowrap",
				color,
				bgcolor: alpha(color, 0.12),
				border: "1px solid",
				borderColor: alpha(color, 0.24),
			}}
		>
			{label}
		</Box>
	);
};

/** Neutral soft pill (bundle `.chip-soft.chip-neutral`) for payment method. */
export const NeutralChip: React.FC<{ label: string }> = ({ label }) => (
	<Box
		component="span"
		sx={{
			display: "inline-flex",
			alignItems: "center",
			px: "8px",
			py: "2px",
			borderRadius: "999px",
			fontSize: 11,
			fontWeight: 600,
			whiteSpace: "nowrap",
			color: "text.secondary",
			bgcolor: "grey.100",
			border: "1px solid",
			borderColor: "divider",
		}}
	>
		{label}
	</Box>
);
