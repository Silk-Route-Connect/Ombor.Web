import React, { useId } from "react";
import { useTranslation } from "react-i18next";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, ButtonBase, InputBase } from "@mui/material";

import { FieldShell } from "./FieldShell";
import { inputSx, leadingIconSx, shellSx } from "./styles";

interface AuthPasswordFieldProps {
	label: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	error?: string;
	autoFocus?: boolean;
	autoComplete?: string;
	onEnter?: () => void;
}

export const AuthPasswordField: React.FC<AuthPasswordFieldProps> = ({
	label,
	value,
	onChange,
	placeholder,
	error,
	autoFocus,
	autoComplete,
	onEnter,
}) => {
	const { t } = useTranslation();
	const [show, setShow] = React.useState(false);
	const inputId = useId();
	return (
		<FieldShell label={label} inputId={inputId} error={error}>
			<Box sx={shellSx(Boolean(error))}>
				<Box sx={leadingIconSx}>
					<LockOutlinedIcon sx={{ fontSize: 18 }} />
				</Box>
				<InputBase
					id={inputId}
					type={show ? "text" : "password"}
					value={value}
					placeholder={placeholder ?? t("auth.field.passwordPlaceholder")}
					autoFocus={autoFocus}
					autoComplete={autoComplete}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && onEnter) onEnter();
					}}
					sx={inputSx}
				/>
				<ButtonBase
					onClick={() => setShow((s) => !s)}
					aria-label={t("auth.togglePasswordVisibility")}
					sx={{ p: "4px", borderRadius: "6px", color: "text.disabled", flex: "0 0 auto" }}
				>
					{show ? (
						<VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
					) : (
						<VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
					)}
				</ButtonBase>
			</Box>
		</FieldShell>
	);
};

export default AuthPasswordField;
