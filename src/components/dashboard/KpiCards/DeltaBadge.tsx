import React from "react";
import { iconSize } from "theme";

import NorthEastIcon from "@mui/icons-material/NorthEast";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import { Box } from "@mui/material";

import { Delta, DeltaTone } from "./types";

const TONE_COLOR: Record<DeltaTone, string> = {
	good: "success.main",
	bad: "error.main",
	neutral: "text.secondary",
	warn: "warning.dark",
};

/** The KPI change badge: a diagonal trend arrow (never the ↓/↑ money arrows) and the text. */
export const DeltaBadge: React.FC<{ delta: Delta }> = ({ delta }) => {
	let icon: React.ReactNode = null;
	if (delta.tone === "warn") {
		icon = <ReportProblemOutlinedIcon sx={{ fontSize: iconSize.xs }} />;
	} else if (delta.direction === "up") {
		icon = <NorthEastIcon sx={{ fontSize: iconSize.xs }} />;
	} else if (delta.direction === "down") {
		icon = <SouthEastIcon sx={{ fontSize: iconSize.xs }} />;
	}
	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "3px",
				fontWeight: 600,
				color: TONE_COLOR[delta.tone],
			}}
		>
			{icon}
			{delta.text}
		</Box>
	);
};

export default DeltaBadge;
