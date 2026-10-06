import React from "react";
import { lineFieldLabelSx } from "components/shared/Forms/lineFieldLabelSx";

import { Box, Typography } from "@mui/material";

interface LineFieldProps {
	label: string;
	/** The control's input id — the caption is its `<label>`. */
	htmlFor: string;
	children: React.ReactNode;
}

/** A caption over one control of a cart / order line (quantity, price, discount). */
export const LineField: React.FC<LineFieldProps> = ({ label, htmlFor, children }) => (
	<Box sx={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
		<Typography component="label" htmlFor={htmlFor} sx={lineFieldLabelSx}>
			{label}
		</Typography>
		{children}
	</Box>
);

export default LineField;
