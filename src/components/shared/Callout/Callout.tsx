import React from "react";
import { chipTokens, designTokens, radius } from "theme";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box, SxProps, Theme } from "@mui/material";

export type CalloutTone = "info" | "warning" | "danger" | "success" | "neutral" | "archived";

interface ToneStyle {
	bg: string;
	border: string;
	/** Body text — the family's on-tint shade, never `*.main` (contrast). */
	fg: string;
	title: string;
	icon: string;
	Icon: React.ElementType;
}

const TONES: Record<CalloutTone, ToneStyle> = {
	info: {
		bg: chipTokens.info.bg,
		border: chipTokens.info.border,
		fg: chipTokens.info.color,
		title: chipTokens.info.color,
		icon: "info.main",
		Icon: InfoOutlinedIcon,
	},
	warning: {
		bg: chipTokens.warning.bg,
		border: chipTokens.warning.border,
		fg: chipTokens.warning.color,
		title: chipTokens.warning.color,
		icon: "warning.main",
		Icon: ReportProblemOutlinedIcon,
	},
	danger: {
		bg: chipTokens.danger.bg,
		border: chipTokens.danger.border,
		fg: chipTokens.danger.color,
		title: chipTokens.danger.color,
		icon: "error.main",
		Icon: ErrorOutlineIcon,
	},
	success: {
		bg: chipTokens.success.bg,
		border: chipTokens.success.border,
		fg: chipTokens.success.color,
		title: chipTokens.success.color,
		icon: "success.main",
		Icon: CheckCircleOutlineIcon,
	},
	neutral: {
		bg: designTokens.bgSubtle,
		border: designTokens.border,
		fg: designTokens.fg2,
		title: designTokens.fg1,
		icon: designTokens.fg3,
		Icon: InfoOutlinedIcon,
	},
	archived: {
		bg: designTokens.bgSubtle,
		border: designTokens.borderStrong,
		fg: designTokens.gray700,
		title: designTokens.fg1,
		icon: designTokens.saffron600,
		Icon: ArchiveOutlinedIcon,
	},
};

export interface CalloutProps {
	tone?: CalloutTone;
	/** Leading glyph; defaults to the tone's own icon, `null` hides it. */
	icon?: React.ReactNode | null;
	/** A bold run-in lead read as the start of the sentence («Касса в архиве.»). */
	title?: React.ReactNode;
	children?: React.ReactNode;
	/** Right-hand action (a «Повторить» text button). */
	action?: React.ReactNode;
	role?: "alert" | "status";
	sx?: SxProps<Theme>;
}

/**
 * The one notice box: a tinted strip with an icon, an optional run-in title, a
 * line or two of text and an optional action. Tones come from the chip families
 * so a notice and a pill of the same meaning share a colour; `archived` is the
 * record-level banner (neutral strip, saffron edge, archive glyph).
 */
export const Callout: React.FC<CalloutProps> = ({
	tone = "info",
	icon,
	title,
	children,
	action,
	role,
	sx,
}) => {
	const style = TONES[tone];
	const glyph = icon === undefined ? <style.Icon /> : icon;

	return (
		<Box
			role={role}
			sx={[
				{
					display: "flex",
					alignItems: "flex-start",
					gap: "10px",
					p: "10px 12px",
					bgcolor: style.bg,
					border: "1px solid",
					borderColor: style.border,
					borderRadius: `${radius.md}px`,
					color: style.fg,
					fontSize: 13,
					lineHeight: "20px",
				},
				tone === "archived" && { borderLeft: "3px solid", borderLeftColor: "secondary.main" },
				...(Array.isArray(sx) ? sx : [sx]),
			]}
		>
			{glyph && (
				<Box
					aria-hidden
					sx={{
						display: "flex",
						alignItems: "center",
						height: 20,
						flex: "0 0 auto",
						color: style.icon,
						"& .MuiSvgIcon-root": { fontSize: 16 },
					}}
				>
					{glyph}
				</Box>
			)}
			<Box sx={{ flex: 1, minWidth: 0 }}>
				{title && (
					<Box component="b" sx={{ fontWeight: 600, color: style.title }}>
						{title}{" "}
					</Box>
				)}
				{children}
			</Box>
			{action && <Box sx={{ flex: "0 0 auto", alignSelf: "center" }}>{action}</Box>}
		</Box>
	);
};

export default Callout;
