import React from "react";

import { Box } from "@mui/material";

/** «—» for a value that does not apply or is not set — the one empty-cell mark. */
export const NoValue: React.FC = () => (
	<Box component="span" sx={{ color: "text.disabled" }}>
		—
	</Box>
);

export default NoValue;
