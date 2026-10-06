import React from "react";
import { designTokens, iconSize, radius } from "theme";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box } from "@mui/material";

const TONES = {
	error: { border: designTokens.errorBorder, bg: designTokens.errorBg, fg: "error.main" },
	info: { border: designTokens.infoBorder, bg: designTokens.infoBg, fg: "info.dark" },
} as const;

interface AuthBannerProps {
	/** `error` for a failed action; `info` for a neutral notice (why the user was signed out). */
	tone?: keyof typeof TONES;
	children: React.ReactNode;
}

/** The message box above an auth form. */
export const AuthBanner: React.FC<AuthBannerProps> = ({ tone = "error", children }) => {
	const colors = TONES[tone];
	const Icon = tone === "error" ? ErrorOutlineIcon : InfoOutlinedIcon;
	return (
		<Box
			role={tone === "error" ? "alert" : "status"}
			sx={{
				display: "flex",
				alignItems: "flex-start",
				gap: "9px",
				p: "11px 13px",
				borderRadius: `${radius.md}px`,
				border: "1px solid",
				borderColor: colors.border,
				bgcolor: colors.bg,
				color: colors.fg,
				fontSize: 13,
				fontWeight: 500,
				lineHeight: 1.4,
			}}
		>
			<Icon sx={{ fontSize: iconSize.sm, flex: "0 0 auto", mt: "1px" }} />
			<Box>{children}</Box>
		</Box>
	);
};

export default AuthBanner;
