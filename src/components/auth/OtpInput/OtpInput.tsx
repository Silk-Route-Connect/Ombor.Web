import React from "react";

import { Box, TextField, Typography } from "@mui/material";

export interface OtpInputProps {
	value: string;
	onChange: (value: string) => void;
	errorText?: string;
	disabled?: boolean;
	/** Autofocus the first cell */
	autoFocus?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, errorText, disabled, autoFocus }) => {
	const inputsRef = React.useRef<Array<HTMLInputElement | null>>([null, null, null, null]);

	const safeValue = value.slice(0, 4).replace(/\D/g, "");
	React.useEffect(() => {
		if (safeValue !== value) {
			onChange(safeValue);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [safeValue]);

	React.useEffect(() => {
		if (autoFocus && inputsRef.current[0]) {
			inputsRef.current[0].focus();
			inputsRef.current[0].select?.();
		}
	}, [autoFocus]);

	const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
		const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
		if (text.length > 0) {
			e.preventDefault();
			onChange(text);
			const nextIndex = Math.min(text.length, 3);
			const el = inputsRef.current[nextIndex];
			if (el) {
				el.focus();
				el.select();
			}
		}
	};

	const handleChange = (index: number, digit: string) => {
		const cleaned = digit.replace(/\D/g, "");
		if (!cleaned) {
			const arr = safeValue.split("");
			arr[index] = "";
			onChange(arr.join(""));
			return;
		}
		if (cleaned.length > 1) return;

		const arr = safeValue.split("");
		arr[index] = cleaned;
		const next = arr.join("");
		onChange(next);

		if (cleaned && index < 3) {
			const el = inputsRef.current[index + 1];
			if (el) {
				el.focus();
				el.select();
			}
		}
	};

	const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
		const target = e.target as HTMLInputElement;
		const index = inputsRef.current.findIndex((n) => n === target);
		if (index < 0) return;

		if (e.key === "Backspace" && !target.value && index > 0) {
			inputsRef.current[index - 1]?.focus();
			inputsRef.current[index - 1]?.select();
		}
		if (e.key === "ArrowLeft" && index > 0) {
			inputsRef.current[index - 1]?.focus();
			inputsRef.current[index - 1]?.select();
		}
		if (e.key === "ArrowRight" && index < 3) {
			inputsRef.current[index + 1]?.focus();
			inputsRef.current[index + 1]?.select();
		}
	};

	const digits = [0, 1, 2, 3].map((i) => safeValue[i] ?? "");

	return (
		<Box sx={{ display: "grid", gap: 1 }}>
			<Box sx={{ display: "flex", gap: 1 }}>
				{digits.map((d, i) => (
					<TextField
						key={i}
						value={d}
						inputRef={(el) => {
							inputsRef.current[i] = el;
						}}
						onChange={(e) => handleChange(i, e.target.value)}
						onKeyDown={handleKeyDown}
						onPaste={handlePaste}
						disabled={disabled}
						inputProps={{
							inputMode: "numeric",
							pattern: "\\d*",
							maxLength: 1,
							style: { textAlign: "center", fontSize: 20, lineHeight: 1.2 },
							"aria-label": `Digit ${i + 1}`,
						}}
						sx={{ width: 56 }}
						error={Boolean(errorText)}
						helperText={i === 3 ? (errorText ?? " ") : " "}
					/>
				))}
			</Box>

			{/* SR-only/visually subtle live region for errors */}
			<Typography
				variant="caption"
				sx={{ position: "absolute", height: 0, width: 0, overflow: "hidden" }}
				aria-live="polite"
			>
				{errorText ?? ""}
			</Typography>
		</Box>
	);
};

export default OtpInput;
