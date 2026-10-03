import React from "react";
import { useTranslation } from "react-i18next";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
	FormControl,
	FormHelperText,
	IconButton,
	InputAdornment,
	InputLabel,
	OutlinedInput,
} from "@mui/material";

export interface PasswordFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	error?: boolean;
	helperText?: string;
	fullWidth?: boolean;
	disabled?: boolean;
	autoComplete?: string;
	name?: string;
	id?: string;
	/** `small` matches the 40px fields of settings forms; omit for the default height. */
	size?: "small" | "medium";
	/** react-hook-form's `field.ref`, so a server error can focus the field. */
	inputRef?: React.Ref<HTMLInputElement>;
	onBlur?: () => void;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
	label,
	value,
	onChange,
	error = false,
	helperText,
	fullWidth = true,
	disabled = false,
	autoComplete = "current-password",
	name,
	id,
	size,
	inputRef,
	onBlur,
}) => {
	const { t } = useTranslation();
	const [show, setShow] = React.useState<boolean>(false);
	const [capsLock, setCapsLock] = React.useState<boolean>(false);

	const toggleShow = (): void => setShow((s) => !s);
	const handleKeyUp: React.KeyboardEventHandler<HTMLInputElement> = (e) =>
		setCapsLock(e.getModifierState("CapsLock"));

	const effectiveHelper = error && helperText ? helperText : capsLock ? t("auth.capsLockOn") : " ";

	const helperId = id ? `${id}-helper` : undefined;

	return (
		<FormControl
			variant="outlined"
			size={size}
			fullWidth={fullWidth}
			error={error}
			disabled={disabled}
		>
			{label && <InputLabel htmlFor={id}>{label}</InputLabel>}

			<OutlinedInput
				id={id}
				name={name}
				inputRef={inputRef}
				type={show ? "text" : "password"}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onBlur={onBlur}
				onKeyUp={handleKeyUp}
				label={label}
				autoComplete={autoComplete}
				aria-invalid={error || undefined}
				aria-describedby={helperId}
				endAdornment={
					<InputAdornment position="end">
						<IconButton
							aria-label={t("auth.togglePasswordVisibility")}
							onClick={toggleShow}
							edge="end"
							size={size}
						>
							{show ? <VisibilityOff /> : <Visibility />}
						</IconButton>
					</InputAdornment>
				}
			/>

			<FormHelperText id={helperId}>{effectiveHelper}</FormHelperText>
		</FormControl>
	);
};

export default PasswordField;
