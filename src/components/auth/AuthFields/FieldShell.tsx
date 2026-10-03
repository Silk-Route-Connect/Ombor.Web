import React from "react";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box, Typography } from "@mui/material";

import { labelSx } from "./styles";

/** The red inline message under an auth field. */
export const FieldError: React.FC<{ message: string }> = ({ message }) => (
	<Box
		sx={{
			display: "inline-flex",
			alignItems: "center",
			gap: "5px",
			fontSize: 12,
			fontWeight: 500,
			color: "error.main",
		}}
	>
		<ErrorOutlineIcon sx={{ fontSize: 13, flex: "0 0 auto" }} />
		{message}
	</Box>
);

interface FieldShellProps {
	label: string;
	optional?: string;
	error?: string;
	children: React.ReactNode;
}

/** Label (with an optional «— необязательно» note) above the input, error below. */
export const FieldShell: React.FC<FieldShellProps> = ({ label, optional, error, children }) => (
	<Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
		<Typography component="span" sx={labelSx}>
			{label}
			{optional && (
				<Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
					— {optional}
				</Box>
			)}
		</Typography>
		{children}
		{error && <FieldError message={error} />}
	</Box>
);
