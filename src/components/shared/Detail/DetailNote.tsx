import React from "react";
import { designTokens, radius } from "theme";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box } from "@mui/material";

/**
 * A quiet one-sentence note at the foot of a rail card — what the figures above
 * mean for the record («Возврат проведён и не подлежит изменению»).
 */
export const DetailNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "flex-start",
			gap: "8px",
			mt: "12px",
			p: "10px 12px",
			bgcolor: designTokens.gray25,
			border: "1px solid",
			borderColor: "divider",
			borderRadius: `${radius.md}px`,
			typography: "caption",
			color: "text.secondary",
		}}
	>
		<InfoOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", mt: "1px", flex: "0 0 auto" }} />
		{children}
	</Box>
);

export default DetailNote;
