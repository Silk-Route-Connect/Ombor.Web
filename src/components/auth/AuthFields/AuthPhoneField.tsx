import React from "react";
import { useTranslation } from "react-i18next";
import { numericSx } from "theme";
import { formatUzNational, UZ_COUNTRY_PREFIX, uzNationalPart } from "utils/phoneUtils";

import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { Box, InputBase } from "@mui/material";

import { FieldShell } from "./FieldShell";
import { inputSx, leadingIconSx, shellSx } from "./styles";

interface AuthPhoneFieldProps {
	label: string;
	value: string;
	onChange: (digits: string) => void;
	error?: string;
	autoFocus?: boolean;
	onEnter?: () => void;
}

/** Holds the 9 national digits, grouped «90 123 45 67» like every phone; «+998» is a fixed prefix. */
export const AuthPhoneField: React.FC<AuthPhoneFieldProps> = ({
	label,
	value,
	onChange,
	error,
	autoFocus,
	onEnter,
}) => {
	const { t } = useTranslation();
	return (
		<FieldShell label={label} error={error}>
			<Box sx={shellSx(Boolean(error))}>
				<Box sx={leadingIconSx}>
					<PhoneOutlinedIcon sx={{ fontSize: 18 }} />
				</Box>
				<Box
					component="span"
					sx={{ ...numericSx, color: "text.secondary", fontWeight: 600, flex: "0 0 auto" }}
				>
					{UZ_COUNTRY_PREFIX}
				</Box>
				<InputBase
					inputMode="tel"
					autoComplete="tel"
					autoFocus={autoFocus}
					value={formatUzNational(value)}
					placeholder={t("auth.field.phonePlaceholder")}
					onChange={(e) => onChange(uzNationalPart(e.target.value))}
					onKeyDown={(e) => {
						if (e.key === "Enter" && onEnter) onEnter();
					}}
					sx={{ ...inputSx, "& input": { ...numericSx, letterSpacing: "0.01em" } }}
				/>
			</Box>
		</FieldShell>
	);
};

export default AuthPhoneField;
