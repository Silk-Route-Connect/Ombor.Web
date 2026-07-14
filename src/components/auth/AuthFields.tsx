import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { designTokens, numericSx } from "theme";
import { formatNationalPhone, onlyDigits } from "utils/authValidation";

import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, ButtonBase, Checkbox, InputBase, Typography } from "@mui/material";

/* ── shared input shell styling (mirrors .ainput) ── */
const shellSx = (error?: boolean) =>
	({
		display: "flex",
		alignItems: "center",
		gap: "9px",
		minHeight: 44,
		px: "12px",
		borderRadius: "8px",
		border: "1px solid",
		borderColor: error ? "error.main" : designTokens.gray300,
		bgcolor: error ? designTokens.errorBg : "background.paper",
		transition: "border-color .14s, box-shadow .14s",
		"&:hover": { borderColor: error ? "error.main" : designTokens.gray400 },
		"&:focus-within": {
			borderColor: error ? "error.main" : "primary.main",
			boxShadow: error
				? `0 0 0 3px ${designTokens.errorBg}`
				: `0 0 0 3px ${designTokens.primarySoft}`,
		},
	}) as const;

const inputSx = {
	flex: 1,
	minWidth: 0,
	fontSize: 14,
	"& input::placeholder": { color: "text.disabled", opacity: 1 },
	// Suppress the browser autofill background tint — keep the field on the shell's
	// own (white) background. The long transition defers the autofill paint.
	"& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active":
		{
			transition: "background-color 9999s ease-in-out 0s",
			WebkitTextFillColor: "currentColor",
			caretColor: "currentColor",
		},
} as const;

const labelSx = {
	fontSize: 13,
	fontWeight: 600,
	color: designTokens.gray700,
	display: "flex",
	alignItems: "center",
	gap: "6px",
} as const;

const FieldError: React.FC<{ message: string }> = ({ message }) => (
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

const FieldShell: React.FC<FieldShellProps> = ({ label, optional, error, children }) => (
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

/* ── text field ── */
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
			{icon && (
				<Box sx={{ display: "inline-flex", color: "text.disabled", flex: "0 0 auto" }}>{icon}</Box>
			)}
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

/* ── phone field (holds 9 national digits, shows +998 prefix) ── */
interface AuthPhoneFieldProps {
	label: string;
	value: string;
	onChange: (digits: string) => void;
	error?: string;
	autoFocus?: boolean;
	onEnter?: () => void;
}

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
				<Box sx={{ display: "inline-flex", color: "text.disabled", flex: "0 0 auto" }}>
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
					onChange={(e) => onChange(onlyDigits(e.target.value).slice(0, 9))}
					onKeyDown={(e) => {
						if (e.key === "Enter" && onEnter) onEnter();
					}}
					sx={{ ...inputSx, "& input": { ...numericSx, letterSpacing: "0.01em" } }}
				/>
			</Box>
		</FieldShell>
	);
};

/* ── password field ── */
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
	return (
		<FieldShell label={label} error={error}>
			<Box sx={shellSx(Boolean(error))}>
				<Box sx={{ display: "inline-flex", color: "text.disabled", flex: "0 0 auto" }}>
					<LockOutlinedIcon sx={{ fontSize: 18 }} />
				</Box>
				<InputBase
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

/* ── OTP / reset code cells ── */
interface AuthCodeInputProps {
	value: string;
	onChange: (v: string) => void;
	length?: number;
	error?: string;
	autoFocus?: boolean;
}

export const AuthCodeInput: React.FC<AuthCodeInputProps> = ({
	value,
	onChange,
	length = 4,
	error,
	autoFocus,
}) => {
	const refs = useRef<Array<HTMLInputElement | null>>([]);
	const cells = Array.from({ length }, (_, i) => value[i] ?? "");

	const setAt = (i: number, raw: string) => {
		const ch = onlyDigits(raw).slice(-1);
		const next = value.split("");
		next[i] = ch || "";
		const joined = next.join("").slice(0, length);
		onChange(joined);
		if (ch && i < length - 1) refs.current[i + 1]?.focus();
	};

	const onKey = (i: number, e: React.KeyboardEvent) => {
		if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
		if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
		if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
	};

	const onPaste = (e: React.ClipboardEvent) => {
		const d = onlyDigits(e.clipboardData.getData("text")).slice(0, length);
		if (d) {
			e.preventDefault();
			onChange(d);
			refs.current[Math.min(d.length, length - 1)]?.focus();
		}
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
			<Box sx={{ display: "flex", justifyContent: "center", gap: "12px" }} onPaste={onPaste}>
				{cells.map((c, i) => {
					const errored = Boolean(error);
					return (
						<Box
							key={i}
							component="input"
							inputMode="numeric"
							maxLength={1}
							autoFocus={autoFocus && i === 0}
							ref={(el: HTMLInputElement | null) => {
								refs.current[i] = el;
							}}
							value={c}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAt(i, e.target.value)}
							onKeyDown={(e: React.KeyboardEvent) => onKey(i, e)}
							sx={{
								width: 52,
								height: 52,
								flex: "0 0 auto",
								textAlign: "center",
								...numericSx,
								fontSize: 22,
								fontWeight: 700,
								color: "text.primary",
								bgcolor: errored ? designTokens.errorBg : "background.paper",
								border: "1px solid",
								borderColor: errored
									? "error.main"
									: c
										? designTokens.primaryLine
										: designTokens.gray300,
								borderRadius: "8px",
								outline: "none",
								transition: "border-color .14s, box-shadow .14s",
								"&:focus": {
									borderColor: "primary.main",
									boxShadow: `0 0 0 3px ${designTokens.primarySoft}`,
								},
							}}
						/>
					);
				})}
			</Box>
			{error && <FieldError message={error} />}
		</Box>
	);
};

/* ── error banner ── */
export const AuthBanner: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "flex-start",
			gap: "9px",
			p: "11px 13px",
			borderRadius: "8px",
			border: "1px solid",
			borderColor: designTokens.errorBorder,
			bgcolor: designTokens.errorBg,
			color: "error.main",
			fontSize: 13,
			fontWeight: 500,
			lineHeight: 1.4,
		}}
	>
		<ErrorOutlineIcon sx={{ fontSize: 17, flex: "0 0 auto", mt: "1px" }} />
		<Box>{children}</Box>
	</Box>
);

/* ── section eyebrow (register) ── */
export const SectionEyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: "10px",
			fontSize: 11,
			letterSpacing: "0.1em",
			textTransform: "uppercase",
			fontWeight: 700,
			color: "primary.main",
		}}
	>
		{children}
		<Box sx={{ flex: 1, height: "1px", bgcolor: designTokens.primaryLine }} />
	</Box>
);

/* ── terms checkbox ── */
interface TermsCheckboxProps {
	checked: boolean;
	error?: boolean;
	onChange: () => void;
	children: React.ReactNode;
}

/** The 18×18 visual box, reused for the checked and unchecked states so the
 *  real <Checkbox> that backs it keeps the bundle's exact look. */
const termsBox = (filled: boolean, error?: boolean) => (
	<Box
		sx={{
			flex: "0 0 auto",
			width: 18,
			height: 18,
			borderRadius: "4px",
			border: "1.5px solid",
			borderColor: error ? "error.main" : filled ? "primary.main" : designTokens.gray300,
			bgcolor: filled ? "primary.main" : "background.paper",
			color: "#fff",
			display: "grid",
			placeItems: "center",
			transition: "background .12s, border-color .12s",
		}}
	>
		{filled && <CheckIcon sx={{ fontSize: 13 }} />}
	</Box>
);

export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
	checked,
	error,
	onChange,
	children,
}) => (
	<Box
		component="label"
		sx={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}
	>
		{/* A real checkbox input — keyboard-focusable, Space-toggleable, and
		    exposed to screen readers with role/aria-checked. The label above
		    associates the text, so clicking it toggles too. */}
		<Checkbox
			checked={checked}
			onChange={onChange}
			aria-invalid={Boolean(error)}
			disableRipple
			icon={termsBox(false, error)}
			checkedIcon={termsBox(true, error)}
			sx={{
				p: 0,
				mt: "1px",
				"&.Mui-focusVisible": {
					outline: "2px solid",
					outlineColor: "primary.main",
					outlineOffset: "2px",
					borderRadius: "4px",
				},
			}}
		/>
		<Box sx={{ fontSize: 12.5, lineHeight: 1.5, color: "text.secondary" }}>{children}</Box>
	</Box>
);
