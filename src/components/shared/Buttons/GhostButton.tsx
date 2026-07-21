import React from "react";
import { designTokens } from "theme";

import Button, { ButtonProps } from "@mui/material/Button";

export interface GhostButtonProps extends ButtonProps {
	icon?: React.ReactNode;
}

/**
 * Secondary page action per the design system's `.btn-ghost`: surface
 * background, strong-border outline, ink text, 7px icon gap, no shadow;
 * hover fills gray-50 and darkens the border.
 */
export const GhostButton: React.FC<GhostButtonProps> = ({ icon, children, sx, ...buttonProps }) => (
	<Button
		startIcon={icon}
		sx={{
			// Height, horizontal padding, font size and radius come from the theme's
			// md control defaults — only the ghost-outline visuals live here.
			bgcolor: "background.paper",
			color: "text.primary",
			border: "1px solid",
			borderColor: designTokens.gray300,
			whiteSpace: "nowrap",
			"& .MuiButton-startIcon": { mr: "7px", ml: 0 },
			"&:hover": { bgcolor: designTokens.gray50, borderColor: designTokens.gray400 },
			...sx,
		}}
		{...buttonProps}
	>
		{children}
	</Button>
);

export default GhostButton;
