import React from "react";
import { chipTokens, designTokens } from "theme";

import NorthEastIcon from "@mui/icons-material/NorthEast";
import { Box, ButtonBase, Paper, Typography } from "@mui/material";

interface ReportHubCardProps {
	icon: React.ReactNode;
	title: string;
	/** The one plain question the report answers. */
	description: string;
	onOpen: () => void;
}

/** One report on the «Отчёты» hub: a keyboard-operable card that opens it. */
const ReportHubCard: React.FC<ReportHubCardProps> = ({ icon, title, description, onOpen }) => (
	<Paper
		elevation={1}
		component={ButtonBase}
		onClick={onOpen}
		sx={{
			position: "relative",
			display: "flex",
			alignItems: "flex-start",
			justifyContent: "flex-start",
			gap: "14px",
			width: "100%",
			height: "100%",
			p: "18px 20px",
			textAlign: "left",
			fontFamily: "inherit",
			border: "1px solid",
			borderColor: "divider",
			borderRadius: "12px",
			transition: "box-shadow .15s, border-color .15s, transform .15s",
			"&:hover": {
				boxShadow: 8,
				borderColor: designTokens.gray300,
				transform: "translateY(-1px)",
				"& .go-arrow": { opacity: 1 },
			},
		}}
	>
		<Box
			component="span"
			className="go-arrow"
			sx={{ position: "absolute", top: 14, right: 14, color: "text.disabled", opacity: 0 }}
		>
			<NorthEastIcon sx={{ fontSize: 15 }} />
		</Box>
		<Box
			component="span"
			sx={{
				width: 42,
				height: 42,
				flex: "0 0 auto",
				borderRadius: "11px",
				display: "grid",
				placeItems: "center",
				bgcolor: chipTokens.teal.bg,
				color: chipTokens.teal.color,
				"& svg": { fontSize: 21 },
			}}
		>
			{icon}
		</Box>
		<Box component="span" sx={{ display: "block", minWidth: 0, pr: "12px" }}>
			<Typography
				component="span"
				sx={{ display: "block", fontSize: 16, fontWeight: 600, color: "text.primary" }}
			>
				{title}
			</Typography>
			<Typography
				component="span"
				sx={{ display: "block", fontSize: 13, color: "text.secondary", mt: "4px" }}
			>
				{description}
			</Typography>
		</Box>
	</Paper>
);

export default ReportHubCard;
