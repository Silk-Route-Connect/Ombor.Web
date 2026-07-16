import React from "react";
import { designTokens } from "theme";

import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Box, ButtonBase, Typography } from "@mui/material";

/** Page heading (title + subtitle) for an auth view. */
export const AuthHead: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
	<Box sx={{ mb: "22px" }}>
		<Typography component="h1" sx={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
			{title}
		</Typography>
		<Typography sx={{ fontSize: 14, color: "text.secondary", mt: "6px", lineHeight: 1.45 }}>
			{subtitle}
		</Typography>
	</Box>
);

/** Inline teal text link — a real button so it is keyboard-focusable and
 *  Enter/Space-activatable. `stopPropagation` keeps clicks from bubbling to an
 *  enclosing label (e.g. the terms checkbox) and toggling it. */
export const AuthLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({
	onClick,
	children,
}) => (
	<ButtonBase
		onClick={(e) => {
			e.stopPropagation();
			onClick();
		}}
		sx={{
			color: "primary.main",
			fontWeight: 600,
			font: "inherit",
			verticalAlign: "baseline",
			p: 0,
			borderRadius: "2px",
			"&:hover": { textDecoration: "underline" },
		}}
	>
		{children}
	</ButtonBase>
);

/** Centered «prompt <link>» line under the actions. */
export const AuthAltLine: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Typography sx={{ textAlign: "center", fontSize: 13.5, color: "text.secondary" }}>
		{children}
	</Typography>
);

/** «‹ back» link (return to login / change phone). */
export const AuthBackLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({
	onClick,
	children,
}) => (
	<ButtonBase
		onClick={onClick}
		sx={{
			display: "inline-flex",
			alignItems: "center",
			gap: "5px",
			mx: "auto",
			color: "primary.main",
			fontWeight: 600,
			fontSize: 13.5,
			"&:hover": { textDecoration: "underline" },
		}}
	>
		<ChevronLeftIcon sx={{ fontSize: 16 }} />
		{children}
	</ButtonBase>
);

/** Success badge (ring + check) for the welcome / password-changed screens. */
export const AuthSuccessBadge: React.FC = () => (
	<Box
		sx={{
			width: 70,
			height: 70,
			borderRadius: "50%",
			mx: "auto",
			mb: "18px",
			bgcolor: designTokens.successBg,
			display: "grid",
			placeItems: "center",
		}}
	>
		<Box
			sx={{
				width: 52,
				height: 52,
				borderRadius: "50%",
				bgcolor: "success.main",
				color: "#fff",
				display: "grid",
				placeItems: "center",
			}}
		>
			<CheckIcon sx={{ fontSize: 28 }} />
		</Box>
	</Box>
);
