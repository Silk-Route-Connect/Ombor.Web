import React from "react";

import { Box, InputBase } from "@mui/material";

import { FieldShell } from "./FieldShell";
import { inputSx, leadingIconSx, shellSx } from "./styles";

interface AuthTextFieldProps {
	label: string;
	optional?: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	icon?: React.ReactNode;
	type?: string;
	error?: string;
	autoFocus?: boolean;
	autoComplete?: string;
	onEnter?: () => void;
}

export const AuthTextField: React.FC<AuthTextFieldProps> = ({
	label,
	optional,
	value,
	onChange,
	placeholder,
	icon,
	type = "text",
	error,
	autoFocus,
	autoComplete,
	onEnter,
}) => (
	<FieldShell label={label} optional={optional} error={error}>
		<Box sx={shellSx(Boolean(error))}>
			{icon && <Box sx={leadingIconSx}>{icon}</Box>}
			<InputBase
				type={type}
				value={value}
				placeholder={placeholder}
				autoFocus={autoFocus}
				autoComplete={autoComplete}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && onEnter) onEnter();
				}}
				sx={inputSx}
			/>
		</Box>
	</FieldShell>
);

export default AuthTextField;
