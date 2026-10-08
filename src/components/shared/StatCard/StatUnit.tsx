import React from "react";

import { Box } from "@mui/material";

/**
 * A non-money unit after a stat figure («ед.», «шт») — the same size, weight and
 * gap as the «UZS» the card puts after money.
 */
const StatUnit: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Box component="span" sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary", ml: "5px" }}>
		{children}
	</Box>
);

export default StatUnit;
