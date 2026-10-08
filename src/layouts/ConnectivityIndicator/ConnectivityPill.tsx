import React from "react";
import { useTranslation } from "react-i18next";
import { chipTokens, iconSize, radius } from "theme";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, ButtonBase, CircularProgress } from "@mui/material";

import { isProblem, ShownStatus, STATUS_PRESENTATION } from "./presentation";
import PulseDot from "./PulseDot";

interface ConnectivityPillProps {
	status: ShownStatus;
	/** A probe is in flight — the dot turns into a spinner. */
	checking: boolean;
	/** The details popover is open. */
	expanded: boolean;
	popoverId: string;
	/** Opens the details (a problem only — «Связь восстановлена» is not clickable). */
	onOpen: (anchor: HTMLElement) => void;
}

/**
 * The header's connection pill: a live dot and «Нет связи с сервером» / «Нет
 * интернета» (the glyph alone below `md`, the words kept as its accessible name),
 * or a green «Связь восстановлена» for a moment after the connection returns.
 */
export const ConnectivityPill: React.FC<ConnectivityPillProps> = ({
	status,
	checking,
	expanded,
	popoverId,
	onOpen,
}) => {
	const { t } = useTranslation();
	const { labelKey, token, dot, icon: Icon } = STATUS_PRESENTATION[status];
	const tone = chipTokens[token];
	const label = t(labelKey);
	const problem = isProblem(status);

	const sx = {
		display: "inline-flex",
		alignItems: "center",
		gap: 1,
		height: 32,
		px: 1.5,
		borderRadius: `${radius.pill}px`,
		border: "1px solid",
		borderColor: tone.border,
		bgcolor: tone.bg,
		color: tone.color,
		fontSize: 13,
		fontWeight: 600,
		whiteSpace: "nowrap",
	} as const;

	const lead = !problem ? (
		<Icon aria-hidden sx={{ fontSize: iconSize.sm, color: dot }} />
	) : checking ? (
		<CircularProgress aria-hidden size={10} thickness={6} color="inherit" />
	) : (
		<PulseDot color={dot} />
	);

	const content = (
		<>
			{lead}
			{problem && (
				<Icon
					aria-hidden
					sx={{ display: { xs: "inline-flex", md: "none" }, fontSize: iconSize.sm }}
				/>
			)}
			<Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
				{label}
			</Box>
			{problem && (
				<ExpandMoreIcon
					aria-hidden
					sx={{
						display: { xs: "none", md: "inline-flex" },
						mr: -0.5,
						fontSize: iconSize.sm,
						transition: "transform .15s",
						transform: expanded ? "rotate(180deg)" : "none",
					}}
				/>
			)}
		</>
	);

	if (!problem) {
		return <Box sx={sx}>{content}</Box>;
	}
	return (
		<ButtonBase
			onClick={(e) => onOpen(e.currentTarget)}
			aria-label={label}
			aria-haspopup="dialog"
			aria-expanded={expanded}
			aria-controls={expanded ? popoverId : undefined}
			sx={{ ...sx, transition: "border-color .15s", "&:hover": { borderColor: tone.color } }}
		>
			{content}
		</ButtonBase>
	);
};

export default ConnectivityPill;
