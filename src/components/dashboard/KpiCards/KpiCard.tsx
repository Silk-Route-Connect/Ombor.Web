import React from "react";
import UzsUnit from "components/shared/Money/UzsUnit";
import { designTokens, typeScale } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import NorthEastIcon from "@mui/icons-material/NorthEast";
import { Box, ButtonBase, Paper, Tooltip, Typography } from "@mui/material";

import { useCountUp } from "../motion";
import DeltaBadge from "./DeltaBadge";
import KpiSparkline from "./KpiSparkline";
import { KpiCardSpec } from "./types";

interface KpiCardProps {
	spec: KpiCardSpec;
	onOpen: () => void;
}

/**
 * One KPI card: caption, hero figure (counted up), change badge + footnote, an
 * optional detail line and the sparkline pinned to the bottom so the cards of a
 * row line up. The whole card is one button that opens the module behind it.
 */
export const KpiCard: React.FC<KpiCardProps> = ({ spec, onOpen }) => {
	const animated = useCountUp(spec.value);

	const card = (
		<Paper
			elevation={1}
			component={ButtonBase}
			onClick={onOpen}
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "stretch",
				width: "100%",
				height: "100%",
				textAlign: "left",
				fontFamily: "inherit",
				position: "relative",
				minWidth: 0,
				border: "1px solid",
				borderColor: "divider",
				borderRadius: "12px",
				p: "16px 18px 14px",
				cursor: "pointer",
				transition: "box-shadow .15s, border-color .15s, transform .15s",
				"&:hover": {
					boxShadow: 8,
					borderColor: designTokens.gray300,
					transform: "translateY(-2px)",
					"& .go-arrow": { opacity: 1 },
					"& .kpi-spark": { opacity: 1 },
				},
			}}
		>
			<Box
				className="go-arrow"
				sx={{
					position: "absolute",
					top: 16,
					right: 16,
					color: "text.disabled",
					opacity: 0,
					transition: "opacity .15s",
				}}
			>
				<NorthEastIcon sx={{ fontSize: 15 }} />
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "7px",
					fontSize: 13,
					color: "text.secondary",
				}}
			>
				<Box sx={{ display: "inline-flex", color: "text.disabled" }}>{spec.icon}</Box>
				{spec.caption}
			</Box>

			<Typography
				sx={{
					...typeScale.numStrong,
					mt: "9px",
					lineHeight: 1.05,
					color: spec.valueColor,
				}}
			>
				{/* Count-up frames tick in whole sums; the settled value is the exact
				    figure, kopecks included («702,01» — never rounded to «702»). */}
				{formatCurrency(animated === spec.value ? spec.value : Math.trunc(animated))}
				<UzsUnit sx={{ fontSize: 13 }} />
			</Typography>

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "8px",
					mt: "9px",
					fontSize: 12,
					flexWrap: "wrap",
				}}
			>
				{spec.delta && <DeltaBadge delta={spec.delta} />}
				<Box component="span" sx={{ fontSize: 12, color: "text.secondary" }}>
					{spec.footnote}
				</Box>
			</Box>

			{spec.detail && (
				<Typography sx={{ fontSize: 12, color: "text.secondary", mt: "4px" }}>
					{spec.detail}
				</Typography>
			)}

			<Box sx={{ mt: "auto" }}>
				<KpiSparkline trend={spec.trend} spark={spec.spark} />
			</Box>
		</Paper>
	);

	if (!spec.tooltip) {
		return card;
	}
	return (
		<Tooltip title={spec.tooltip} placement="bottom-start" enterTouchDelay={0}>
			{card}
		</Tooltip>
	);
};

export default KpiCard;
