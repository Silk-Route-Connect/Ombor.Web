import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { designTokens, numericSx } from "theme";
import { onlyDigits } from "utils/authValidation";

import { Box } from "@mui/material";

import { FieldError } from "./FieldShell";

interface AuthCodeInputProps {
	value: string;
	onChange: (v: string) => void;
	/** Digits in the code — the server's `codeLength`, never a constant. */
	length: number;
	error?: string;
	autoFocus?: boolean;
	onEnter?: () => void;
}

/** One cell per digit of an SMS code; typing advances, Backspace goes back, paste fills all. */
export const AuthCodeInput: React.FC<AuthCodeInputProps> = ({
	value,
	onChange,
	length,
	error,
	autoFocus,
	onEnter,
}) => {
	const { t } = useTranslation();
	const refs = useRef<Array<HTMLInputElement | null>>([]);
	const cells = Array.from({ length }, (_, i) => value[i] ?? "");
	const errored = Boolean(error);

	const setAt = (i: number, raw: string) => {
		const ch = onlyDigits(raw).slice(-1);
		const next = value.split("");
		next[i] = ch || "";
		onChange(next.join("").slice(0, length));
		if (ch && i < length - 1) refs.current[i + 1]?.focus();
	};

	const onKey = (i: number, e: React.KeyboardEvent) => {
		if (e.key === "Enter" && onEnter) onEnter();
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
			<Box sx={{ display: "flex", justifyContent: "center", gap: "10px" }} onPaste={onPaste}>
				{cells.map((c, i) => (
					<Box
						key={i}
						component="input"
						inputMode="numeric"
						// The first cell takes the phone's SMS-code autofill; paste spreads it.
						autoComplete={i === 0 ? "one-time-code" : "off"}
						aria-label={t("auth.code.digit", { index: i + 1, count: length })}
						aria-invalid={errored || undefined}
						maxLength={1}
						autoFocus={autoFocus && i === 0}
						ref={(el: HTMLInputElement | null) => {
							refs.current[i] = el;
						}}
						value={c}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAt(i, e.target.value)}
						onKeyDown={(e: React.KeyboardEvent) => onKey(i, e)}
						sx={{
							// Cells shrink to fit 6–8 digits on a phone-width card.
							flex: "1 1 0",
							minWidth: 0,
							maxWidth: 52,
							height: 52,
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
									: designTokens.borderControl,
							borderRadius: "8px",
							outline: "none",
							transition: "border-color .14s, box-shadow .14s",
							"&:focus": {
								borderColor: "primary.main",
								boxShadow: `0 0 0 3px ${designTokens.primarySoft}`,
							},
						}}
					/>
				))}
			</Box>
			{error && <FieldError message={error} />}
		</Box>
	);
};

export default AuthCodeInput;
