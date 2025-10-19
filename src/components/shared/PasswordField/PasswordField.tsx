import React from "react";
import { translate } from "i18n/i18n";

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
}) => {
	const [show, setShow] = React.useState<boolean>(false);
	const [capsLock, setCapsLock] = React.useState<boolean>(false);

	const toggleShow = (): void => setShow((s) => !s);
	const handleKeyUp: React.KeyboardEventHandler<HTMLInputElement> = (e) =>
		setCapsLock(e.getModifierState("CapsLock"));

	const effectiveHelper =
		error && helperText ? helperText : capsLock ? translate("auth.capsLockOn") : " ";

	const helperId = id ? `${id}-helper` : undefined;

	return (
		<FormControl variant="outlined" fullWidth={fullWidth} error={error} disabled={disabled}>
			{label && <InputLabel htmlFor={id}>{label}</InputLabel>}

			<OutlinedInput
				id={id}
				name={name}
				type={show ? "text" : "password"}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyUp={handleKeyUp}
				label={label}
				autoComplete={autoComplete}
				aria-invalid={error || undefined}
				aria-describedby={helperId}
				endAdornment={
					<InputAdornment position="end">
						<IconButton
							aria-label={translate("auth.togglePasswordVisibility")}
							onClick={toggleShow}
							edge="end"
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
