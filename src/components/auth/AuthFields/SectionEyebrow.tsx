import React from "react";
import { designTokens } from "theme";

import { Box, Typography } from "@mui/material";

/** Teal overline section label with a hairline (register form: «Бизнес», «Аккаунт»). */
export const SectionEyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Typography
		variant="overline"
		component="div"
		sx={{ display: "flex", alignItems: "center", gap: "10px", color: "primary.main" }}
	>
		{children}
		<Box sx={{ flex: 1, height: "1px", bgcolor: designTokens.primaryLine }} />
	</Typography>
);

export default SectionEyebrow;
