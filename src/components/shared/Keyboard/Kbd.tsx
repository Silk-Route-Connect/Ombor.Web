import React from "react";
import { designTokens, numericSx, radius } from "theme";

import { Box } from "@mui/material";

/** One keycap («Ctrl», «K», «Enter», «↑») in a shortcut hint. */
export const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Box
		component="kbd"
		sx={{
			...numericSx,
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			minWidth: 20,
			height: 20,
			px: "6px",
			fontFamily: "inherit",
			fontSize: 11,
			fontWeight: 600,
			lineHeight: 1,
			color: designTokens.gray700,
			bgcolor: "background.paper",
			border: "1px solid",
			borderColor: designTokens.gray300,
			borderRadius: `${radius.xs}px`,
			boxShadow: `0 1px 0 ${designTokens.border}`,
		}}
	>
		{children}
	</Box>
);

export default Kbd;
