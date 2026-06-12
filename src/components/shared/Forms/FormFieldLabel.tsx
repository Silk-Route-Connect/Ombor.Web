import React from "react";
import { designTokens } from "theme";

import { Box, Typography } from "@mui/material";

export interface FormFieldLabelProps {
	label: string;
	required?: boolean;
	htmlFor?: string;
}

/**
 * Field label above an input per the design system's `.flabel`: 13px/600
 * gray-700, with the required mark as an error-colored asterisk.
 */
export const FormFieldLabel: React.FC<FormFieldLabelProps> = ({ label, required, htmlFor }) => (
	<Typography
		component="label"
		htmlFor={htmlFor}
		sx={{
			display: "inline-flex",
			alignItems: "center",
			gap: "4px",
			fontSize: 13,
			fontWeight: 600,
			color: designTokens.gray700,
		}}
	>
		{label}
		{required && (
			<Box component="span" sx={{ color: "error.main" }}>
				*
			</Box>
		)}
	</Typography>
);

export default FormFieldLabel;
