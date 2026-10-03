import React from "react";
import { designTokens } from "theme";

import { Box } from "@mui/material";

/** Uppercase teal section label with a hairline (register form: «Бизнес», «Аккаунт»). */
export const SectionEyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: "10px",
			fontSize: 11,
			letterSpacing: "0.1em",
			textTransform: "uppercase",
			fontWeight: 700,
			color: "primary.main",
		}}
	>
		{children}
		<Box sx={{ flex: 1, height: "1px", bgcolor: designTokens.primaryLine }} />
	</Box>
);

export default SectionEyebrow;
