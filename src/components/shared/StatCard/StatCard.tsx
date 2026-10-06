import React from "react";
import IconTile from "components/shared/IconTile/IconTile";
import InfoHint from "components/shared/InfoHint/InfoHint";
import UzsUnit from "components/shared/Money/UzsUnit";
import { designTokens, radius, typeScale } from "theme";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import { Box, ButtonBase, Paper, Tooltip, Typography } from "@mui/material";

import { STAT_TONE_TOKEN, StatTone } from "./statTone";

export interface StatCardProps {
	/** The glyph of the figure (16–18px icon), shown on a tinted tile. */
	icon?: React.ReactNode;
	/** Tint of the icon tile — the card's accent; the figure keeps its own colour. */
	tone?: StatTone;
	caption: React.ReactNode;
	/**
	 * One plain sentence explaining the term («i» beside the caption). `true` marks
	 * the caption only — a clickable card whose `tooltip` already says it.
	 */
	hint?: string | boolean;
	/** The formatted figure, or «—» while the source has not loaded. */
	value: React.ReactNode;
	/** Colour of the figure — money semantics stay with the caller (pattern 4, DR-27). */
	valueColor?: string;
	/** «UZS» after money; any other node for a qualified unit («шт», «UZS / мес»). */
	unit?: "uzs" | React.ReactNode;
	/** The line under the figure: a change badge, a count, what the figure is made of. */
	footer?: React.ReactNode;
	/** A second muted line. */
	detail?: React.ReactNode;
	/** Pinned to the bottom so the cards of a row line up (a sparkline). */
	chart?: React.ReactNode;
	/** Makes the whole card one button (opens the module, toggles a filter). */
	onClick?: () => void;
	/** Pressed state of a toggle card (`aria-pressed`). */
	active?: boolean;
	/** Border colour of an active toggle card. */
	activeColor?: string;
	/** Hover / focus card describing the figure (a breakdown). */
	tooltip?: React.ReactNode;
}

const GO_ARROW_CLASS = "stat-go";

/**
 * A 26px figure in a signal shade reads as a traffic light; the card draws it in
 * the same family's dark on-tint shade — the hue (and so the meaning, pattern 4)
 * is unchanged. Table money, sparklines and icons keep the `.main` shades.
 */
const HERO_SHADE: Record<string, string> = {
	"success.main": "success.dark",
	"error.main": "error.dark",
	// The aging axis is amber; the warning family's dark shade leans olive.
	"warning.main": designTokens.saffron700,
};

/**
 * The one summary-figure card of the app — dashboard KPIs, list summary strips,
 * detail KPIs and report totals share this anatomy: icon tile · caption (+ «i»)
 * · the figure with its unit · a footer line · optional detail and chart. A
 * clickable card lifts on hover and shows ↗; a toggle card shows its pressed state.
 */
const StatCard: React.FC<StatCardProps> = ({
	icon,
	tone = "neutral",
	caption,
	hint,
	value,
	valueColor = "text.primary",
	unit,
	footer,
	detail,
	chart,
	onClick,
	active,
	activeColor,
	tooltip,
}) => {
	const clickable = Boolean(onClick);
	const accent = active && activeColor ? activeColor : undefined;

	const card = (
		<Paper
			elevation={1}
			component={clickable ? ButtonBase : "div"}
			onClick={onClick}
			aria-pressed={active === undefined ? undefined : active}
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "stretch",
				justifyContent: "flex-start",
				width: "100%",
				height: "100%",
				minWidth: 0,
				position: "relative",
				textAlign: "left",
				fontFamily: "inherit",
				border: 1,
				borderColor: accent ?? "divider",
				borderRadius: `${radius.lg}px`,
				p: 2.25,
				containerType: "inline-size",
				cursor: clickable ? "pointer" : "default",
				transition: "box-shadow .15s, border-color .15s, transform .15s",
				...(active && { boxShadow: 8 }),
				...(clickable && {
					"&:hover": {
						boxShadow: 8,
						borderColor: accent ?? designTokens.borderStrong,
						transform: "translateY(-2px)",
						[`& .${GO_ARROW_CLASS}`]: { opacity: 1 },
					},
				}),
			}}
		>
			{clickable && (
				<NorthEastIcon
					className={GO_ARROW_CLASS}
					aria-hidden
					sx={{
						position: "absolute",
						top: 16,
						right: 16,
						fontSize: 16,
						color: accent ?? "text.disabled",
						opacity: active ? 1 : 0,
						transition: "opacity .15s",
					}}
				/>
			)}

			<Box sx={{ display: "flex", alignItems: "center", gap: 1.25, pr: clickable ? 3 : 0 }}>
				{icon && <IconTile icon={icon} token={STAT_TONE_TOKEN[tone]} />}
				<Typography
					component="span"
					variant="body2"
					sx={{ fontWeight: 500, color: "text.secondary", minWidth: 0 }}
				>
					{caption}
				</Typography>
				{/* Inside a clickable card the tooltip carries the hint, so the «i» is a
				    marker only (no second tab stop inside the button). */}
				{hint &&
					(clickable || typeof hint !== "string" ? (
						<InfoOutlinedIcon aria-hidden sx={{ fontSize: 14, color: "text.disabled" }} />
					) : (
						<InfoHint text={hint} />
					))}
			</Box>

			<Typography
				component="div"
				sx={{
					...typeScale.numStrong,
					mt: 1.5,
					lineHeight: 1.1,
					color: HERO_SHADE[valueColor] ?? valueColor,
					overflowWrap: "anywhere",
					// A big figure with kopecks is wider than a quarter-row card on a 1366px
					// laptop; a narrow card steps the figure down instead of wrapping it.
					"@container (max-width: 300px)": { fontSize: 20 },
				}}
			>
				{value}
				{unit === "uzs" ? <UzsUnit sx={{ fontSize: 13 }} /> : unit}
			</Typography>

			{footer && (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						flexWrap: "wrap",
						columnGap: 1,
						rowGap: 0.5,
						mt: 1,
						typography: "caption",
						color: "text.secondary",
					}}
				>
					{footer}
				</Box>
			)}
			{detail && (
				<Typography variant="caption" component="div" sx={{ color: "text.secondary", mt: 0.5 }}>
					{detail}
				</Typography>
			)}
			{chart && <Box sx={{ mt: "auto", pt: 1 }}>{chart}</Box>}
		</Paper>
	);

	if (!tooltip) {
		return card;
	}
	return (
		// describeChild: the tooltip describes the card; as an aria-label it would
		// replace the card's own name.
		<Tooltip title={tooltip} describeChild placement="bottom-start" enterTouchDelay={0}>
			{card}
		</Tooltip>
	);
};

export default StatCard;
