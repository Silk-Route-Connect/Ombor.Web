import React from "react";
import { designTokens } from "theme";

import { Box, Paper, Typography } from "@mui/material";

interface Props {
	/** Anchor id used by the sticky nav scroll-spy (rendered as `settings-<id>`). */
	id: string;
	icon: React.ReactNode;
	title: string;
	subtitle?: string;
	/** Right-aligned header action (e.g. «Пригласить пользователя»). */
	action?: React.ReactNode;
	children: React.ReactNode;
}

/**
 * Section card per the bundle's `.set-card`: a bordered surface with a header
 * (tinted icon tile + title/subtitle + optional action) and a padded body.
 */
const SettingsSectionCard: React.FC<Props> = ({ id, icon, title, subtitle, action, children }) => (
	<Paper
		id={`settings-${id}`}
		elevation={1}
		sx={{
			border: "1px solid",
			borderColor: "divider",
			borderRadius: "12px",
			overflow: "hidden",
			scrollMarginTop: "16px",
		}}
	>
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "12px",
				p: "16px 22px",
				borderBottom: "1px solid",
				borderColor: "divider",
			}}
		>
			<Box
				sx={{
					width: 30,
					height: 30,
					flex: "0 0 auto",
					borderRadius: "8px",
					display: "grid",
					placeItems: "center",
					bgcolor: designTokens.primarySoft,
					color: "primary.main",
				}}
			>
				{icon}
			</Box>
			<Box sx={{ minWidth: 0 }}>
				<Typography sx={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>
					{title}
				</Typography>
				{subtitle && (
					<Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "2px" }}>
						{subtitle}
					</Typography>
				)}
			</Box>
			{action && (
				<>
					<Box sx={{ flex: 1 }} />
					{action}
				</>
			)}
		</Box>
		<Box sx={{ p: "22px" }}>{children}</Box>
	</Paper>
);

export default SettingsSectionCard;
