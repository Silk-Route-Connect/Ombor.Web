import React from "react";
import { useTranslation } from "react-i18next";
import { numericSx } from "theme";
import { formatNationalPhone, onlyDigits, PHONE_DIGITS } from "utils/authValidation";

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

/** Holds the 9 national digits; «+998» is a fixed prefix in front of them. */
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
					+998
				</Box>
				<InputBase
					inputMode="tel"
					autoComplete="tel"
					autoFocus={autoFocus}
					value={formatNationalPhone(value)}
					placeholder={t("auth.field.phonePlaceholder")}
					onChange={(e) => onChange(onlyDigits(e.target.value).slice(0, PHONE_DIGITS))}
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
